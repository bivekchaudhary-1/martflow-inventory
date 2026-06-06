/**
 * MartFlow — Supabase API layer
 * Implements all 14 APIs from the spec.
 * Falls back to mock data if Supabase is not configured.
 */
import { supabase } from '../supabaseClient';
import { mockItems, mockCategories, mockLocations } from './mockData';

// ── Mock fallback store ───────────────────────────────────────────────────────
let _items      = mockItems.map(i => ({ ...i }));
let _categories = mockCategories.map(c => ({ ...c }));
let _locations  = mockLocations.map(l => ({ ...l }));
let _suppliers  = [
  { id:1, name:'Apple Distribution',  contact_name:'John Apple',  email:'orders@apple-dist.com', phone:'+1-800-275-2273', is_active:true },
  { id:2, name:'Dell Technologies',   contact_name:'Jane Dell',   email:'sales@dell.com',        phone:'+1-800-624-9897', is_active:true },
  { id:3, name:'Logitech Direct',     contact_name:'Marc Log',    email:'b2b@logitech.com',      phone:'+1-510-795-8500', is_active:true },
  { id:4, name:'IKEA Business',       contact_name:'Anna IKEA',   email:'business@ikea.com',     phone:'+1-888-888-4532', is_active:true },
  { id:5, name:'Cisco Systems',       contact_name:'Rob Cisco',   email:'sales@cisco.com',       phone:'+1-800-553-2447', is_active:true },
  { id:6, name:'Office Depot B2B',    contact_name:'Sue Office',  email:'b2b@officedepot.com',   phone:'+1-800-463-3768', is_active:true },
  { id:7, name:'Raspberry Pi Ltd',    contact_name:'Eben Upton',  email:'trade@raspberrypi.com', phone:'+44-1223-000000', is_active:true },
  { id:8, name:'Generic Supplies Co', contact_name:'Tom Generic', email:'info@genericsupply.com',phone:'+1-555-000-0000', is_active:true },
];
let _alerts = [];
let _auditLog = [];
let _transactions = [];
let _purchaseOrders = [];

// ── Helper ────────────────────────────────────────────────────────────────────
function sb() { return supabase; }
function useMock() { return !supabase; }
function sbErr(error, context) {
  if (error) throw new Error(`Supabase ${context}: ${error.message}`);
}

// ═══════════════════════════════════════════════════════════════════════════════
// API 1 — Users / Profiles
// ═══════════════════════════════════════════════════════════════════════════════

export async function getProfiles() {
  if (useMock()) return [
    { id:1, username:'admin',   full_name:'Admin User',   role:'admin',   email:'admin@martflow.com' },
    { id:2, username:'manager', full_name:'Jane Manager', role:'manager', email:'manager@martflow.com' },
    { id:3, username:'staff',   full_name:'Bob Staff',    role:'staff',   email:'staff@martflow.com' },
  ];
  const { data, error } = await sb().from('profiles').select('*');
  sbErr(error, 'getProfiles');
  return data;
}

export async function getProfile(userId) {
  if (useMock()) return (await getProfiles()).find(u => u.id === userId) ?? null;
  const { data, error } = await sb().from('profiles').select('*').eq('id', userId).single();
  sbErr(error, 'getProfile');
  return data;
}

export async function updateProfile(userId, payload) {
  if (useMock()) return { id: userId, ...payload };
  const { data, error } = await sb().from('profiles').update(payload).eq('id', userId);
  sbErr(error, 'updateProfile');
  return data;
}

// ═══════════════════════════════════════════════════════════════════════════════
// API 2 — Locations
// ═══════════════════════════════════════════════════════════════════════════════

export async function getLocations() {
  if (useMock()) return [..._locations];
  const { data, error } = await sb().from('locations').select('*').eq('is_active', true);
  sbErr(error, 'getLocations');
  return data;
}

export async function createLocation(payload) {
  if (useMock()) {
    const loc = { ...payload, id: Math.max(..._locations.map(l => l.id), 0) + 1, used: 0, is_active: true };
    _locations.push(loc);
    return loc;
  }
  const { data, error } = await sb().from('locations').insert(payload).select().single();
  sbErr(error, 'createLocation');
  return data;
}

export async function updateLocation(id, payload) {
  if (useMock()) {
    const idx = _locations.findIndex(l => l.id === Number(id));
    if (idx === -1) throw new Error('Not found');
    _locations[idx] = { ..._locations[idx], ...payload };
    return _locations[idx];
  }
  const { data, error } = await sb().from('locations').update(payload).eq('id', id).select().single();
  sbErr(error, 'updateLocation');
  return data;
}

export async function deleteLocation(id) {
  if (useMock()) { _locations = _locations.filter(l => l.id !== Number(id)); return true; }
  const { error } = await sb().from('locations').delete().eq('id', id);
  sbErr(error, 'deleteLocation');
  return true;
}

// ═══════════════════════════════════════════════════════════════════════════════
// API 3 — Suppliers
// ═══════════════════════════════════════════════════════════════════════════════

export async function getSuppliers() {
  if (useMock()) return [..._suppliers];
  const { data, error } = await sb().from('suppliers').select('*').eq('is_active', true);
  sbErr(error, 'getSuppliers');
  return data;
}

export async function createSupplier(payload) {
  if (useMock()) {
    const s = { ...payload, id: Math.max(..._suppliers.map(s => s.id), 0) + 1, is_active: true };
    _suppliers.push(s);
    return s;
  }
  const { data, error } = await sb().from('suppliers').insert(payload).select().single();
  sbErr(error, 'createSupplier');
  return data;
}

export async function updateSupplier(id, payload) {
  if (useMock()) {
    const idx = _suppliers.findIndex(s => s.id === Number(id));
    if (idx === -1) throw new Error('Not found');
    _suppliers[idx] = { ..._suppliers[idx], ...payload };
    return _suppliers[idx];
  }
  const { data, error } = await sb().from('suppliers').update(payload).eq('id', id).select().single();
  sbErr(error, 'updateSupplier');
  return data;
}

export async function deleteSupplier(id) {
  if (useMock()) { _suppliers = _suppliers.filter(s => s.id !== Number(id)); return true; }
  const { error } = await sb().from('suppliers').delete().eq('id', id);
  sbErr(error, 'deleteSupplier');
  return true;
}

// ═══════════════════════════════════════════════════════════════════════════════
// API 4 — Categories
// ═══════════════════════════════════════════════════════════════════════════════

export async function getCategories() {
  if (useMock()) return [..._categories];
  const { data, error } = await sb().from('categories').select('*');
  sbErr(error, 'getCategories');
  return data;
}

export async function createCategory(payload) {
  if (useMock()) {
    const c = { ...payload, id: Math.max(..._categories.map(c => c.id), 0) + 1 };
    _categories.push(c);
    return c;
  }
  const { data, error } = await sb().from('categories').insert(payload).select().single();
  sbErr(error, 'createCategory');
  return data;
}

export async function updateCategory(id, payload) {
  if (useMock()) {
    const idx = _categories.findIndex(c => c.id === Number(id));
    if (idx === -1) throw new Error('Not found');
    _categories[idx] = { ..._categories[idx], ...payload };
    return _categories[idx];
  }
  const { data, error } = await sb().from('categories').update(payload).eq('id', id).select().single();
  sbErr(error, 'updateCategory');
  return data;
}

export async function deleteCategory(id) {
  if (useMock()) { _categories = _categories.filter(c => c.id !== Number(id)); return true; }
  const { error } = await sb().from('categories').delete().eq('id', id);
  sbErr(error, 'deleteCategory');
  return true;
}

// ═══════════════════════════════════════════════════════════════════════════════
// API 5 — Items (Core CRUD)  — reads from v_items view (with joins)
// ═══════════════════════════════════════════════════════════════════════════════

export async function getItems() {
  if (useMock()) return [..._items];
  // Try the enriched view first; fall back to raw table if view doesn't exist yet
  try {
    const { data, error } = await sb().from('v_items').select('*');
    if (!error && data) return data;
  } catch {}
  const { data, error } = await sb().from('items').select('*').eq('is_active', true);
  sbErr(error, 'getItems');
  return data ?? [];
}

export async function getItemById(id) {
  if (useMock()) return _items.find(i => i.id === Number(id)) ?? null;
  try {
    const { data, error } = await sb().from('v_items').select('*').eq('id', id).single();
    if (!error && data) return data;
  } catch {}
  const { data, error } = await sb().from('items').select('*').eq('id', id).single();
  sbErr(error, 'getItemById');
  return data;
}

export async function createItem(payload) {
  if (useMock()) {
    const item = { ...payload, id: Math.max(..._items.map(i => i.id), 0) + 1 };
    _items.push(item);
    _recordAudit('create', item, null, item);
    return item;
  }
  const { data, error } = await sb().from('items').insert(payload).select().single();
  sbErr(error, 'createItem');
  return data;
}

export async function updateItem(id, payload) {
  if (useMock()) {
    const idx = _items.findIndex(i => i.id === Number(id));
    if (idx === -1) throw new Error('Not found');
    const before = { ..._items[idx] };
    _items[idx] = { ..._items[idx], ...payload };
    _recordAudit('update', _items[idx], before, _items[idx]);
    return _items[idx];
  }
  const { data, error } = await sb().from('items').update(payload).eq('id', id).select().single();
  sbErr(error, 'updateItem');
  return data;
}

export async function deleteItem(id) {
  if (useMock()) {
    const item = _items.find(i => i.id === Number(id));
    _items = _items.filter(i => i.id !== Number(id));
    if (item) _recordAudit('delete', item, item, null);
    return true;
  }
  // Soft delete
  const { error } = await sb().from('items').update({ is_active: false }).eq('id', id);
  sbErr(error, 'deleteItem');
  return true;
}

// ═══════════════════════════════════════════════════════════════════════════════
// API 6 — Low Stock Items
// ═══════════════════════════════════════════════════════════════════════════════

export async function getLowStockItems() {
  if (useMock()) return _items.filter(i => i.stock_count < (i.min_stock ?? 10));
  // Try RPC first
  try {
    const { data, error } = await sb().rpc('get_low_stock_items');
    if (!error && data) return data;
  } catch {}
  // Try v_items view
  try {
    const { data, error } = await sb().from('v_items').select('*').eq('is_low_stock', true).order('stock_count', { ascending: true });
    if (!error && data) return data;
  } catch {}
  // Fallback: query items table directly (works before views/RPCs exist)
  try {
    const { data, error } = await sb().from('items').select('*').filter('stock_count', 'lt', 10).eq('is_active', true).order('stock_count', { ascending: true });
    if (!error && data) return data;
  } catch {}
  return [];
}

// ═══════════════════════════════════════════════════════════════════════════════
// API 7 — Item Search
// ═══════════════════════════════════════════════════════════════════════════════

export async function searchItems(query) {
  if (useMock()) {
    const q = query.toLowerCase();
    return _items.filter(i => i.name.toLowerCase().includes(q));
  }
  try {
    const { data, error } = await sb().rpc('search_items', { query });
    if (!error) return data;
  } catch {}
  const { data, error } = await sb().from('v_items').select('*').ilike('name', `%${query}%`);
  sbErr(error, 'searchItems');
  return data;
}

// ═══════════════════════════════════════════════════════════════════════════════
// API 8 — Item Detail (full joins)
// ═══════════════════════════════════════════════════════════════════════════════

export async function getItemDetail(itemId) {
  if (useMock()) {
    const item = _items.find(i => i.id === Number(itemId));
    const category = _categories.find(c => c.id === item?.category_id);
    const location = _locations.find(l => l.name === item?.location);
    return { item, category, location, supplier: null, tags: [], recent_transactions: [], recent_audit: [] };
  }
  try {
    const { data, error } = await sb().rpc('get_item_detail', { p_item_id: itemId });
    if (!error) return data;
  } catch {}
  // Fallback: manual joins
  const item = await getItemById(itemId);
  return { item, category: null, location: null, supplier: null, tags: [], recent_transactions: [], recent_audit: [] };
}

// ═══════════════════════════════════════════════════════════════════════════════
// API 9 — Stock Transactions
// ═══════════════════════════════════════════════════════════════════════════════

export async function getTransactions({ itemId, page = 0, pageSize = 50 } = {}) {
  if (useMock()) {
    let result = [..._transactions].sort((a, b) => b.id - a.id);
    if (itemId) result = result.filter(t => t.item_id === Number(itemId));
    return result.slice(page * pageSize, page * pageSize + pageSize);
  }
  let query = sb().from('stock_transactions')
    .select('*, items(name)')
    .order('created_at', { ascending: false })
    .range(page * pageSize, page * pageSize + pageSize - 1);
  if (itemId) query = query.eq('item_id', itemId);
  const { data, error } = await query;
  sbErr(error, 'getTransactions');
  return data;
}

export async function createTransaction(payload) {
  if (useMock()) {
    const t = { ...payload, id: (_transactions.length + 1), created_at: new Date().toISOString() };
    _transactions.push(t);
    // Update item stock
    const idx = _items.findIndex(i => i.id === payload.item_id);
    if (idx !== -1) _items[idx].stock_count = payload.quantity_after;
    return t;
  }
  const { data, error } = await sb().from('stock_transactions').insert(payload).select().single();
  sbErr(error, 'createTransaction');
  return data;
}

// ═══════════════════════════════════════════════════════════════════════════════
// API 10 — Audit Log
// ═══════════════════════════════════════════════════════════════════════════════

export async function getAuditLog({ action, itemId, username, limit = 100 } = {}) {
  if (useMock()) {
    let result = [..._auditLog].reverse();
    if (action)   result = result.filter(e => e.action === action);
    if (itemId)   result = result.filter(e => e.entity_id === Number(itemId));
    if (username) result = result.filter(e => e.username === username);
    return result.slice(0, limit);
  }
  let query = sb().from('audit_log').select('*').order('created_at', { ascending: false }).limit(limit);
  if (action)   query = query.eq('action', action);
  if (itemId)   query = query.eq('entity_id', itemId).eq('entity', 'item');
  if (username) query = query.eq('username', username);
  const { data, error } = await query;
  sbErr(error, 'getAuditLog');
  return data;
}

// ═══════════════════════════════════════════════════════════════════════════════
// API 11 — Alerts
// ═══════════════════════════════════════════════════════════════════════════════

export async function getActiveAlerts() {
  if (useMock()) return _alerts.filter(a => !a.is_acknowledged);
  // Try the enriched view first
  try {
    const { data, error } = await sb().from('v_active_alerts').select('*').order('created_at', { ascending: false });
    if (!error && data) return data;
  } catch {}
  // Fallback to raw table
  const { data, error } = await sb().from('alerts').select('*')
    .eq('is_acknowledged', false).order('created_at', { ascending: false });
  sbErr(error, 'getActiveAlerts');
  return data ?? [];
}

export async function acknowledgeAlert(alertId, userId) {
  if (useMock()) {
    const idx = _alerts.findIndex(a => a.id === alertId);
    if (idx !== -1) _alerts[idx] = { ..._alerts[idx], is_acknowledged: true, acknowledged_at: new Date().toISOString() };
    return _alerts[idx] ?? null;
  }
  // Use the RPC from the patch — it sets acknowledged_by via auth.uid()
  try {
    const { error } = await sb().rpc('acknowledge_alert', { alert_id: alertId });
    if (!error) return true;
  } catch {}
  // Fallback: direct update (for environments without the RPC yet)
  const { data, error } = await sb().from('alerts').update({
    is_acknowledged: true,
    acknowledged_by: userId ?? null,
    acknowledged_at: new Date().toISOString(),
  }).eq('id', alertId).select().single();
  sbErr(error, 'acknowledgeAlert');
  return data;
}

export async function acknowledgeItemAlerts(itemId, userId) {
  if (useMock()) {
    _alerts = _alerts.map(a =>
      a.item_id === Number(itemId) ? { ...a, is_acknowledged: true } : a
    );
    return true;
  }
  // Use the RPC from the patch
  try {
    const { error } = await sb().rpc('acknowledge_item_alerts', { p_item_id: itemId });
    if (!error) return true;
  } catch {}
  // Fallback: direct update
  const { error } = await sb().from('alerts').update({
    is_acknowledged: true,
    acknowledged_by: userId ?? null,
    acknowledged_at: new Date().toISOString(),
  }).eq('item_id', itemId).eq('is_acknowledged', false);
  sbErr(error, 'acknowledgeItemAlerts');
  return true;
}

// ═══════════════════════════════════════════════════════════════════════════════
// API 12 — Purchase Orders
// ═══════════════════════════════════════════════════════════════════════════════

export async function getPurchaseOrders() {
  if (useMock()) return [..._purchaseOrders];
  const { data, error } = await sb()
    .from('purchase_orders')
    .select('*, suppliers(name), purchase_order_items(*, items(name, sku))')
    .order('created_at', { ascending: false });
  sbErr(error, 'getPurchaseOrders');
  return data;
}

export async function getPurchaseOrder(poId) {
  if (useMock()) return _purchaseOrders.find(p => p.id === Number(poId)) ?? null;
  const { data, error } = await sb()
    .from('purchase_orders')
    .select('*, suppliers(name), purchase_order_items(*, items(name))')
    .eq('id', poId)
    .single();
  sbErr(error, 'getPurchaseOrder');
  return data;
}

export async function createPurchaseOrder(header, lines) {
  if (useMock()) {
    const po = { ...header, id: (_purchaseOrders.length + 1), status: 'draft', created_at: new Date().toISOString(), items: lines };
    _purchaseOrders.push(po);
    return po;
  }
  const { data: po, error: poErr } = await sb().from('purchase_orders').insert(header).select().single();
  sbErr(poErr, 'createPO-header');
  const linesWithPoId = lines.map(l => ({ ...l, po_id: po.id }));
  const { error: lineErr } = await sb().from('purchase_order_items').insert(linesWithPoId);
  sbErr(lineErr, 'createPO-lines');
  return po;
}

export async function updatePurchaseOrderStatus(poId, status) {
  if (useMock()) {
    const idx = _purchaseOrders.findIndex(p => p.id === Number(poId));
    if (idx !== -1) _purchaseOrders[idx].status = status;
    return _purchaseOrders[idx];
  }
  const { data, error } = await sb().from('purchase_orders').update({ status }).eq('id', poId).select().single();
  sbErr(error, 'updatePOStatus');
  return data;
}

// ═══════════════════════════════════════════════════════════════════════════════
// API 13 — Receive Purchase Order
// Uses receive_po_item RPC (from patch) for each line — atomic, triggers stock
// updates, transaction logging, and alert checks all via DB triggers.
// ═══════════════════════════════════════════════════════════════════════════════

export async function receivePOItem(poItemId, quantityReceived) {
  if (useMock()) {
    // Find the PO line, update it, and bump item stock
    for (const po of _purchaseOrders) {
      const line = (po.items || []).find(l => l.id === poItemId);
      if (line) {
        const qty = Math.min(quantityReceived, line.quantity - (line.received ?? 0));
        line.received = (line.received ?? 0) + qty;
        const idx = _items.findIndex(i => i.id === line.item_id);
        if (idx !== -1) _items[idx].stock_count += qty;
        // Close PO if all lines received
        const allDone = (po.items || []).every(l => (l.received ?? 0) >= l.quantity);
        if (allDone) { po.status = 'received'; po.received_date = new Date().toISOString().split('T')[0]; }
        return true;
      }
    }
    return true;
  }
  // Use the RPC from the patch
  try {
    const { error } = await sb().rpc('receive_po_item', {
      po_item_id:        poItemId,
      quantity_received: quantityReceived,
    });
    if (!error) return true;
  } catch {}
  // Fallback: manual loop (no RPC available yet)
  const { data: line } = await sb().from('purchase_order_items')
    .select('item_id, quantity, received, po_id').eq('id', poItemId).single();
  if (!line) throw new Error('PO line not found');
  const qty = Math.min(quantityReceived, line.quantity - (line.received ?? 0));
  if (qty <= 0) return true;
  await sb().from('items').rpc  // intentional error to skip — handled below
    .catch(() => null);
  const { data: item } = await sb().from('items').select('stock_count').eq('id', line.item_id).single();
  await sb().from('items').update({ stock_count: (item?.stock_count ?? 0) + qty }).eq('id', line.item_id);
  await sb().from('purchase_order_items').update({ received: (line.received ?? 0) + qty }).eq('id', poItemId);
  // Check if PO is fully received
  const { data: allLines } = await sb().from('purchase_order_items').select('quantity, received').eq('po_id', line.po_id);
  const allDone = (allLines ?? []).every(l => (l.received ?? 0) >= l.quantity);
  if (allDone) {
    await sb().from('purchase_orders').update({ status: 'received', received_date: new Date().toISOString().split('T')[0] }).eq('id', line.po_id);
  }
  return true;
}

export async function receivePurchaseOrder(poId) {
  if (useMock()) {
    const po = _purchaseOrders.find(p => p.id === Number(poId));
    if (po) {
      for (const line of (po.items || [])) {
        await receivePOItem(line.id, line.quantity - (line.received ?? 0));
      }
    }
    return true;
  }
  // Fetch all unreceived lines and receive them via the RPC
  const { data: lines } = await sb().from('purchase_order_items')
    .select('id, quantity, received')
    .eq('po_id', poId);
  for (const line of (lines ?? [])) {
    const remaining = line.quantity - (line.received ?? 0);
    if (remaining > 0) {
      await receivePOItem(line.id, remaining);
    }
  }
  return true;
}

// ═══════════════════════════════════════════════════════════════════════════════
// API 14 — Dashboard Stats  (never throws, always returns a valid object)
// ═══════════════════════════════════════════════════════════════════════════════

const EMPTY_STATS = {
  total_items: 0, total_categories: 0, total_locations: 0, total_suppliers: 0,
  total_stock_value: 0, low_stock_count: 0, out_of_stock_count: 0,
  active_alerts: 0, transactions_today: 0,
  items_by_velocity: { fast: 0, medium: 0, slow: 0 },
  items_by_category: [],
  // Legacy aliases
  totalItems: 0, totalQuantity: 0, lowStockCount: 0, totalLocations: 0, totalValue: 0,
  recentItems: [], lowStockItems: [],
};

export async function getDashboardStats() {
  if (useMock()) {
    const items = [..._items];
    const velCounts = { fast: 0, medium: 0, slow: 0 };
    items.forEach(i => { velCounts[i.velocity_status] = (velCounts[i.velocity_status] || 0) + 1; });
    const totalValue = items.reduce((s, i) => s + i.stock_count * (i.unit_price ?? 0), 0);
    return {
      total_items:        items.length,
      total_categories:   _categories.length,
      total_locations:    _locations.length,
      total_suppliers:    _suppliers.length,
      total_stock_value:  totalValue,
      low_stock_count:    items.filter(i => i.stock_count < (i.min_stock ?? 10)).length,
      out_of_stock_count: items.filter(i => i.stock_count === 0).length,
      active_alerts:      _alerts.filter(a => !a.is_acknowledged).length,
      transactions_today: 0,
      items_by_velocity:  velCounts,
      items_by_category:  _categories.map(c => ({
        name:  c.name,
        count: items.filter(i => i.category_id === c.id).length,
        value: items.filter(i => i.category_id === c.id).reduce((s, i) => s + i.stock_count * (i.unit_price ?? 0), 0),
      })),
      // Legacy aliases
      totalItems:     items.length,
      totalQuantity:  items.reduce((s, i) => s + i.stock_count, 0),
      lowStockCount:  items.filter(i => i.stock_count < (i.min_stock ?? 10)).length,
      totalLocations: _locations.length,
      totalValue,
      recentItems:    [...items].sort((a, b) => b.id - a.id).slice(0, 5),
      lowStockItems:  items.filter(i => i.stock_count < (i.min_stock ?? 10)).slice(0, 5),
    };
  }

  // 1. Try the get_dashboard_stats RPC
  try {
    const { data, error } = await sb().rpc('get_dashboard_stats');
    if (!error && data) {
      return {
        ...EMPTY_STATS,
        ...data,
        totalItems:     data.total_items     ?? 0,
        totalQuantity:  data.total_stock_value ?? 0,
        lowStockCount:  data.low_stock_count  ?? 0,
        totalLocations: data.total_locations  ?? 0,
        totalValue:     data.total_stock_value ?? 0,
        recentItems:    [],
        lowStockItems:  [],
      };
    }
  } catch {}

  // 2. RPC doesn't exist yet — build stats manually from raw tables
  try {
    const [
      { count: itemCount },
      { count: catCount },
      { count: locCount },
      { count: supCount },
      { data: items },
    ] = await Promise.all([
      sb().from('items').select('*', { count: 'exact', head: true }).eq('is_active', true),
      sb().from('categories').select('*', { count: 'exact', head: true }),
      sb().from('locations').select('*', { count: 'exact', head: true }).eq('is_active', true),
      sb().from('suppliers').select('*', { count: 'exact', head: true }).eq('is_active', true),
      sb().from('items').select('id,name,stock_count,min_stock,unit_price,velocity_status,location_id,category_id,updated_at').eq('is_active', true),
    ]);

    const safeItems = items ?? [];
    const totalValue = safeItems.reduce((s, i) => s + (i.stock_count ?? 0) * (i.unit_price ?? 0), 0);
    const velCounts  = { fast: 0, medium: 0, slow: 0 };
    safeItems.forEach(i => { if (i.velocity_status) velCounts[i.velocity_status] = (velCounts[i.velocity_status] || 0) + 1; });
    const lowItems = safeItems.filter(i => i.stock_count < (i.min_stock ?? 10));

    return {
      total_items:        itemCount  ?? 0,
      total_categories:   catCount   ?? 0,
      total_locations:    locCount   ?? 0,
      total_suppliers:    supCount   ?? 0,
      total_stock_value:  totalValue,
      low_stock_count:    lowItems.length,
      out_of_stock_count: safeItems.filter(i => i.stock_count === 0).length,
      active_alerts:      0,
      transactions_today: 0,
      items_by_velocity:  velCounts,
      items_by_category:  [],
      // Legacy aliases
      totalItems:     itemCount  ?? 0,
      totalQuantity:  safeItems.reduce((s, i) => s + (i.stock_count ?? 0), 0),
      lowStockCount:  lowItems.length,
      totalLocations: locCount   ?? 0,
      totalValue,
      recentItems:    [...safeItems].sort((a, b) => b.id - a.id).slice(0, 5),
      lowStockItems:  lowItems.slice(0, 5),
    };
  } catch {}

  // 3. Everything failed — return safe empty object so Dashboard never crashes
  return { ...EMPTY_STATS };
}

// ═══════════════════════════════════════════════════════════════════════════════
// Auth — Supabase email/password + mock fallback
// ═══════════════════════════════════════════════════════════════════════════════

export async function login(username, password) {
  if (useMock()) {
    if (password !== 'password123') throw new Error('Invalid credentials');
    const mockUsers = [
      { id: 1, username: 'admin',   role: 'admin'   },
      { id: 2, username: 'manager', role: 'manager' },
      { id: 3, username: 'staff',   role: 'staff'   },
    ];
    const user = mockUsers.find(u => u.username === username) ?? mockUsers[0];
    return { user, access_token: 'mock-token', token_type: 'bearer' };
  }
  // Treat username as email for Supabase auth
  const email = username.includes('@') ? username : `${username}@martflow.local`;
  const { data, error } = await sb().auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  return {
    user: {
      id:       data.user.id,
      username: data.user.email?.split('@')[0] ?? username,
      role:     data.user.user_metadata?.role ?? 'staff',
    },
    access_token: data.session.access_token,
    token_type:   'bearer',
  };
}

export async function logout() {
  if (useMock()) return;
  await sb().auth.signOut();
}

// ═══════════════════════════════════════════════════════════════════════════════
// Mock audit helper (mock-only, real audit happens via DB triggers)
// ═══════════════════════════════════════════════════════════════════════════════

function _recordAudit(action, item, before, after) {
  _auditLog.push({
    id:          _auditLog.length + 1,
    timestamp:   new Date().toISOString(),
    created_at:  new Date().toISOString(),
    action,
    entity:      'item',
    entity_id:   item.id,
    entity_name: item.name,
    username:    'admin',
    before,
    after,
  });
}
