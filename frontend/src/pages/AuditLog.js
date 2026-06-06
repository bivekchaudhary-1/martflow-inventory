import { useEffect, useState, useMemo } from 'react';
import { getAuditLog } from '../api/supabase';

const ACTION_STYLES = {
  create: { cls: 'bg-emerald-500/15 text-emerald-300', label: 'Created' },
  update: { cls: 'bg-cyan-500/15 text-cyan-300',       label: 'Updated' },
  delete: { cls: 'bg-rose-500/15 text-rose-300',       label: 'Deleted' },
};

function ActionPill({ action }) {
  const s = ACTION_STYLES[action] ?? { cls: 'bg-slate-700 text-slate-300', label: action };
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${s.cls}`}>{s.label}</span>;
}

// Schema uses before_data / after_data (JSONB columns)
function DiffView({ before, after }) {
  if (!before && !after) return null;
  const b = typeof before === 'string' ? JSON.parse(before) : before;
  const a = typeof after  === 'string' ? JSON.parse(after)  : after;

  const keys = Array.from(new Set([...Object.keys(b ?? {}), ...Object.keys(a ?? {})]));
  // Skip noisy metadata fields
  const skip = new Set(['updated_at', 'created_at']);
  const changed = keys.filter(k => !skip.has(k) && JSON.stringify((b ?? {})[k]) !== JSON.stringify((a ?? {})[k]));

  if (changed.length === 0) return <span className="text-slate-500 text-xs">No field changes</span>;

  return (
    <div className="space-y-1.5">
      {changed.map(k => (
        <div key={k} className="flex items-start gap-2 text-xs font-mono">
          <span className="text-slate-500 w-32 truncate flex-shrink-0 pt-0.5">{k}</span>
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            {b && <span className="text-rose-400 line-through truncate max-w-[9rem]">{String((b)[k] ?? '—')}</span>}
            {b && a && <span className="text-slate-600">→</span>}
            {a && <span className="text-emerald-400 truncate max-w-[9rem]">{String((a)[k] ?? '—')}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

function fmt(ts) {
  if (!ts) return '—';
  try {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
    }).format(new Date(ts));
  } catch { return ts; }
}

export default function AuditLog() {
  const [entries, setEntries]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [expanded, setExpanded]         = useState(null);
  const [filterAction, setFilterAction] = useState('');
  const [filterUser, setFilterUser]     = useState('');
  const [search, setSearch]             = useState('');

  useEffect(() => {
    let cancelled = false;

    async function fetch() {
      try {
        const data = await getAuditLog({ action: filterAction || undefined, username: filterUser || undefined, limit: 200 });
        if (!cancelled) setEntries(data ?? []);
      } catch {
        if (!cancelled) setEntries([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetch();
    const interval = setInterval(fetch, 5000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [filterAction, filterUser]);

  const filtered = useMemo(() => {
    if (!search.trim()) return entries;
    const q = search.toLowerCase();
    return entries.filter(e =>
      (e.entity_name ?? '').toLowerCase().includes(q) ||
      (e.username    ?? '').toLowerCase().includes(q) ||
      (e.meta        ?? '').toLowerCase().includes(q)
    );
  }, [entries, search]);

  const uniqueUsers = useMemo(() => [...new Set(entries.map(e => e.username).filter(Boolean))], [entries]);

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-100">Audit Log</h1>
          <p className="text-sm text-slate-500 mt-1">
            {filtered.length} entr{filtered.length !== 1 ? 'ies' : 'y'} · auto-refreshes every 5s
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 flex-shrink-0 mt-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"/>
          Live
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 min-w-0">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search item, user, or note…"
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/40 transition-colors"/>
        </div>
        <div className="flex gap-3">
          <select value={filterAction} onChange={e => setFilterAction(e.target.value)}
            className="flex-1 sm:flex-none bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-cyan-500 transition-colors">
            <option value="">All Actions</option>
            <option value="create">Created</option>
            <option value="update">Updated</option>
            <option value="delete">Deleted</option>
          </select>
          <select value={filterUser} onChange={e => setFilterUser(e.target.value)}
            className="flex-1 sm:flex-none bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-cyan-500 transition-colors">
            <option value="">All Users</option>
            {uniqueUsers.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
      </div>

      {/* List */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-7 h-7 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"/>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-500">
            <svg className="w-10 h-10 mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
            <p className="text-sm">
              {entries.length === 0 ? 'No audit entries yet — changes to items are logged here automatically' : 'No entries match your filters'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {filtered.map(entry => {
              const isOpen    = expanded === entry.id;
              // Schema: before_data / after_data; FastAPI fallback: before / after
              const before    = entry.before_data ?? entry.before;
              const after     = entry.after_data  ?? entry.after;
              const hasDiff   = before || after;
              const timestamp = entry.created_at ?? entry.timestamp;

              return (
                <div key={entry.id} className="hover:bg-slate-800/40 transition-colors">
                  <button className="w-full text-left px-4 sm:px-6 py-4" onClick={() => setExpanded(isOpen ? null : entry.id)}>
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="flex-shrink-0 pt-0.5">
                        <ActionPill action={entry.action}/>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-slate-200 truncate">{entry.entity_name}</span>
                          <span className="text-xs text-slate-500 font-mono">#{entry.entity_id}</span>
                          {entry.entity && entry.entity !== 'item' && (
                            <span className="text-xs text-slate-600 capitalize">{entry.entity}</span>
                          )}
                        </div>
                        {entry.meta && <p className="text-xs text-slate-400 mt-0.5 truncate">{entry.meta}</p>}
                      </div>
                      <div className="flex-shrink-0 text-right min-w-0">
                        <p className="text-xs text-slate-400 truncate max-w-[7rem]">{entry.username}</p>
                        <p className="text-xs text-slate-600 mt-0.5 whitespace-nowrap">{fmt(timestamp)}</p>
                      </div>
                      {hasDiff && (
                        <svg className={`w-4 h-4 text-slate-600 flex-shrink-0 mt-0.5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                          fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                        </svg>
                      )}
                    </div>
                  </button>

                  {isOpen && hasDiff && (
                    <div className="px-4 sm:px-6 pb-4">
                      <div className="bg-slate-950 rounded-xl p-4 border border-slate-800">
                        <p className="text-xs uppercase tracking-widest text-slate-500 mb-3">Field Changes</p>
                        <DiffView before={before} after={after}/>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
