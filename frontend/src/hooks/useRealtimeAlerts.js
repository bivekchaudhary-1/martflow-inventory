/**
 * useRealtimeAlerts
 * -----------------
 * Three Supabase Realtime channels (per the spec):
 *   1. items-changes  — UPDATE on items → low-stock detection
 *   2. new-alerts     — INSERT on alerts → push toast
 *   3. audit-stream   — INSERT on audit_log → live feed
 *
 * SSE fallback — connects to FastAPI /events/stream when Supabase is unavailable.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '../supabaseClient';

const SSE_URL = `${(process.env.REACT_APP_API_URL || 'http://localhost:8000').replace('/api/v1', '')}/events/stream`;
const MAX_FEED = 30;

export function useRealtimeAlerts() {
  const [alerts, setAlerts]       = useState([]);
  const [auditFeed, setAuditFeed] = useState([]);
  const [connected, setConnected] = useState(false);
  const esRef = useRef(null);

  const addAlert = useCallback((alert) => {
    setAlerts(prev => {
      const deduped = prev.filter(a => a.item_id !== alert.item_id);
      return [alert, ...deduped].slice(0, 10);
    });
  }, []);

  const dismissAlert = useCallback((itemId) => {
    setAlerts(prev => prev.filter(a => a.item_id !== itemId));
  }, []);

  const clearAlerts = useCallback(() => setAlerts([]), []);

  const addAuditEntry = useCallback((entry) => {
    setAuditFeed(prev => [entry, ...prev].slice(0, MAX_FEED));
  }, []);

  // ── Supabase Realtime ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!supabase) return;

    // Channel 1: stock changes on items table
    const itemsChannel = supabase
      .channel('items-changes')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'items' }, (payload) => {
        const row = payload.new;
        if (!row) return;
        if (row.stock_count < (row.min_stock ?? 10)) {
          addAlert({
            item_id:     row.id,
            item_name:   row.name,
            stock_count: row.stock_count,
            location:    row.location_id,
            timestamp:   new Date().toISOString(),
            source:      'realtime',
          });
        } else {
          // Stock recovered — remove existing alert for this item
          dismissAlert(row.id);
        }
      })
      .subscribe((status) => setConnected(status === 'SUBSCRIBED'));

    // Channel 2: new alerts inserted by DB triggers
    const alertsChannel = supabase
      .channel('new-alerts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'alerts' }, (payload) => {
        const row = payload.new;
        if (row) {
          addAlert({
            item_id:     row.item_id,
            item_name:   row.item_name ?? `Item #${row.item_id}`,
            stock_count: row.stock_count ?? 0,
            location:    row.location ?? '',
            timestamp:   row.created_at ?? new Date().toISOString(),
            source:      'db-trigger',
            alert_id:    row.id,
          });
        }
      })
      .subscribe();

    // Channel 3: audit log stream
    const auditChannel = supabase
      .channel('audit-stream')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'audit_log' }, (payload) => {
        const row = payload.new;
        if (row) addAuditEntry(row);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(itemsChannel);
      supabase.removeChannel(alertsChannel);
      supabase.removeChannel(auditChannel);
    };
  }, [addAlert, dismissAlert, addAuditEntry]);

  // ── SSE fallback (always open — also handles mock mode) ───────────────────
  useEffect(() => {
    let retryTimeout;

    function connect() {
      esRef.current?.close();
      const es = new EventSource(SSE_URL);
      esRef.current = es;

      es.addEventListener('open',  () => { if (!supabase) setConnected(true); });

      es.addEventListener('low_stock', (e) => {
        try { addAlert({ ...JSON.parse(e.data), source: 'sse' }); } catch {}
      });
      es.addEventListener('stock_recovered', (e) => {
        try { dismissAlert(JSON.parse(e.data).item_id); } catch {}
      });
      es.addEventListener('audit', (e) => {
        try { addAuditEntry(JSON.parse(e.data)); } catch {}
      });
      es.addEventListener('heartbeat', () => { if (!supabase) setConnected(true); });

      es.onerror = () => {
        es.close();
        if (!supabase) setConnected(false);
        retryTimeout = setTimeout(connect, 5000);
      };
    }

    connect();
    return () => { clearTimeout(retryTimeout); esRef.current?.close(); esRef.current = null; };
  }, [addAlert, dismissAlert, addAuditEntry]);

  return { alerts, auditFeed, clearAlerts, dismissAlert, connected };
}
