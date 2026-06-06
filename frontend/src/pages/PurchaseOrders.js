import { useEffect, useState } from 'react';
import {
  getPurchaseOrders, createPurchaseOrder, updatePurchaseOrderStatus,
  receivePurchaseOrder, receivePOItem, getSuppliers, getItems,
} from '../api/supabase';

const STATUS_STYLES = {
  draft:     'bg-slate-700/60 text-slate-300',
  sent:      'bg-cyan-500/15 text-cyan-300',
  received:  'bg-emerald-500/15 text-emerald-300',
  cancelled: 'bg-rose-500/15 text-rose-300',
};

const inputCls = "w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/40 transition-colors text-sm";
const labelCls = "block text-xs uppercase tracking-widest text-slate-500 mb-2";

function fmt(ts) {
  if (!ts) return '—';
  try { return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
  catch { return ts; }
}

export default function PurchaseOrders() {
  const [orders, setOrders]         = useState([]);
  const [suppliers, setSuppliers]   = useState([]);
  const [items, setItems]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [expanded, setExpanded]     = useState(null);
  const [showModal, setShowModal]   = useState(false);
  const [receiving, setReceiving]   = useState(null); // po id being received
  const [actionId, setActionId]     = useState(null);

  // New PO form state
  const [poForm, setPoForm] = useState({ supplier_id: '', expected_date: '', notes: '' });
  const [lines, setLines]   = useState([{ item_id: '', quantity: '', unit_cost: '' }]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([getPurchaseOrders(), getSuppliers(), getItems()])
      .then(([o, s, i]) => { setOrders(o ?? []); setSuppliers(s ?? []); setItems(i ?? []); })
      .finally(() => setLoading(false));
  }, []);

  const itemName = (id) => items.find(i => i.id === Number(id))?.name ?? `#${id}`;
  const supplierName = (id) => suppliers.find(s => s.id === Number(id))?.name ?? `#${id}`;

  const addLine  = () => setLines(p => [...p, { item_id: '', quantity: '', unit_cost: '' }]);
  const dropLine = (i) => setLines(p => p.filter((_, idx) => idx !== i));
  const setLine  = (i, field, val) => setLines(p => p.map((l, idx) => idx === i ? { ...l, [field]: val } : l));

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const header = {
        supplier_id:   Number(poForm.supplier_id) || null,
        expected_date: poForm.expected_date || null,
        notes:         poForm.notes || null,
        status:        'draft',
      };
      const poLines = lines
        .filter(l => l.item_id && l.quantity)
        .map(l => ({
          item_id:   Number(l.item_id),
          quantity:  Number(l.quantity),
          unit_cost: parseFloat(l.unit_cost) || 0,
        }));
      const po = await createPurchaseOrder(header, poLines);
      // Re-fetch so we get the po_number and joined data
      const fresh = await getPurchaseOrders();
      setOrders(fresh ?? []);
      setShowModal(false);
      setPoForm({ supplier_id: '', expected_date: '', notes: '' });
      setLines([{ item_id: '', quantity: '', unit_cost: '' }]);
      setExpanded(po.id);
    } finally { setSaving(false); }
  };

  const handleStatusChange = async (poId, status) => {
    setActionId(poId);
    await updatePurchaseOrderStatus(poId, status);
    setOrders(prev => prev.map(o => o.id === poId ? { ...o, status } : o));
    setActionId(null);
  };

  const handleReceiveAll = async (poId) => {
    setReceiving(poId);
    await receivePurchaseOrder(poId);
    const fresh = await getPurchaseOrders();
    setOrders(fresh ?? []);
    setReceiving(null);
  };

  const totalAmount = (po) => {
    const lines = po.purchase_order_items ?? po.items ?? [];
    return lines.reduce((s, l) => s + (l.quantity ?? 0) * (l.unit_cost ?? 0), 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-100">Purchase Orders</h1>
          <p className="text-sm text-slate-500 mt-1">{orders.length} order{orders.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex-shrink-0 flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-sm rounded-xl px-4 py-2.5 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
          </svg>
          <span className="hidden sm:inline">New Order</span>
          <span className="sm:hidden">New</span>
        </button>
      </div>

      {/* List */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-7 h-7 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"/>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-500">
            <svg className="w-10 h-10 mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
            <p className="text-sm">No purchase orders yet</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {orders.map(po => {
              const isOpen     = expanded === po.id;
              const poLines    = po.purchase_order_items ?? po.items ?? [];
              const isReceiving = receiving === po.id;
              const isActioning = actionId === po.id;

              return (
                <div key={po.id}>
                  {/* Row */}
                  <button className="w-full text-left px-4 sm:px-6 py-4 hover:bg-slate-800/40 transition-colors"
                    onClick={() => setExpanded(isOpen ? null : po.id)}>
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="font-mono text-sm font-semibold text-slate-100">
                            {po.po_number ?? `PO-${po.id}`}
                          </span>
                          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${STATUS_STYLES[po.status] ?? 'bg-slate-700 text-slate-300'}`}>
                            {po.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {po.suppliers?.name ?? supplierName(po.supplier_id)}
                          {po.expected_date ? ` · Expected ${fmt(po.expected_date)}` : ''}
                          {poLines.length > 0 ? ` · ${poLines.length} line${poLines.length !== 1 ? 's' : ''}` : ''}
                        </p>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <p className="text-sm font-semibold text-slate-200">
                          ${totalAmount(po).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <p className="text-xs text-slate-600 mt-0.5">{fmt(po.created_at)}</p>
                      </div>
                      <svg className={`w-4 h-4 text-slate-600 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                      </svg>
                    </div>
                  </button>

                  {/* Expanded detail */}
                  {isOpen && (
                    <div className="px-4 sm:px-6 pb-5 space-y-4">
                      {/* Line items */}
                      {poLines.length > 0 && (
                        <div className="rounded-xl border border-slate-800 overflow-hidden">
                          <table className="min-w-full text-sm">
                            <thead className="border-b border-slate-800">
                              <tr className="text-xs uppercase tracking-widest text-slate-500">
                                <th className="px-4 py-2.5 text-left font-medium">Item</th>
                                <th className="px-4 py-2.5 text-left font-medium">Ordered</th>
                                <th className="px-4 py-2.5 text-left font-medium">Received</th>
                                <th className="px-4 py-2.5 text-left font-medium">Unit Cost</th>
                                <th className="px-4 py-2.5 text-left font-medium">Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {poLines.map((line, i) => {
                                const rcvd    = line.received ?? 0;
                                const ordered = line.quantity ?? 0;
                                const pct     = ordered > 0 ? (rcvd / ordered) * 100 : 0;
                                return (
                                  <tr key={line.id ?? i} className="border-t border-slate-800">
                                    <td className="px-4 py-2.5 text-slate-200 whitespace-nowrap">
                                      {line.items?.name ?? itemName(line.item_id)}
                                    </td>
                                    <td className="px-4 py-2.5 text-slate-400">{ordered}</td>
                                    <td className="px-4 py-2.5">
                                      <div className="flex items-center gap-2">
                                        <span className={rcvd >= ordered ? 'text-emerald-300' : rcvd > 0 ? 'text-amber-300' : 'text-slate-400'}>
                                          {rcvd}
                                        </span>
                                        <div className="w-12 h-1 rounded-full bg-slate-800 overflow-hidden">
                                          <div className={`h-full rounded-full ${rcvd >= ordered ? 'bg-emerald-500' : 'bg-amber-500'}`}
                                            style={{ width: `${pct}%` }}/>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-4 py-2.5 text-slate-400">${Number(line.unit_cost ?? 0).toFixed(2)}</td>
                                    <td className="px-4 py-2.5 text-slate-300">${(ordered * Number(line.unit_cost ?? 0)).toFixed(2)}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {po.notes && (
                        <p className="text-xs text-slate-500 italic">Note: {po.notes}</p>
                      )}

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2">
                        {po.status === 'draft' && (
                          <button onClick={() => handleStatusChange(po.id, 'sent')} disabled={isActioning}
                            className="flex items-center gap-1.5 bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 text-xs font-semibold rounded-lg px-3 py-2 transition-colors disabled:opacity-40">
                            Mark as Sent
                          </button>
                        )}
                        {(po.status === 'draft' || po.status === 'sent') && (
                          <button onClick={() => handleReceiveAll(po.id)} disabled={isReceiving}
                            className="flex items-center gap-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 text-xs font-semibold rounded-lg px-3 py-2 transition-colors disabled:opacity-40">
                            {isReceiving ? (
                              <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                              </svg>
                            ) : null}
                            Receive All
                          </button>
                        )}
                        {po.status !== 'cancelled' && po.status !== 'received' && (
                          <button onClick={() => handleStatusChange(po.id, 'cancelled')} disabled={isActioning}
                            className="flex items-center gap-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold rounded-lg px-3 py-2 transition-colors disabled:opacity-40">
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create PO modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 flex-shrink-0">
              <h2 className="text-lg font-semibold text-slate-100">New Purchase Order</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-slate-300 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreate} className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-5">
                {/* Header */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-1">
                    <label className={labelCls}>Supplier</label>
                    <select value={poForm.supplier_id} onChange={e => setPoForm(p => ({ ...p, supplier_id: e.target.value }))} required className={inputCls}>
                      <option value="">— Select —</option>
                      {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Expected Date</label>
                    <input type="date" value={poForm.expected_date} onChange={e => setPoForm(p => ({ ...p, expected_date: e.target.value }))} className={inputCls}/>
                  </div>
                  <div className="sm:col-span-1">
                    <label className={labelCls}>Notes</label>
                    <input type="text" value={poForm.notes} onChange={e => setPoForm(p => ({ ...p, notes: e.target.value }))} placeholder="Optional" className={inputCls}/>
                  </div>
                </div>

                {/* Line items */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className={`${labelCls} mb-0`}>Line Items</label>
                    <button type="button" onClick={addLine}
                      className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
                      </svg>
                      Add line
                    </button>
                  </div>
                  <div className="space-y-3">
                    {lines.map((line, i) => (
                      <div key={i} className="grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-6">
                          <select value={line.item_id} onChange={e => setLine(i, 'item_id', e.target.value)} required className={inputCls}>
                            <option value="">Select item…</option>
                            {items.map(it => <option key={it.id} value={it.id}>{it.name}</option>)}
                          </select>
                        </div>
                        <div className="col-span-2">
                          <input type="number" min="1" value={line.quantity} onChange={e => setLine(i, 'quantity', e.target.value)} placeholder="Qty" required className={inputCls}/>
                        </div>
                        <div className="col-span-3">
                          <input type="number" min="0" step="0.01" value={line.unit_cost} onChange={e => setLine(i, 'unit_cost', e.target.value)} placeholder="Unit $" className={inputCls}/>
                        </div>
                        <div className="col-span-1 flex justify-center">
                          {lines.length > 1 && (
                            <button type="button" onClick={() => dropLine(i)} className="text-slate-600 hover:text-rose-400 transition-colors">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Total */}
                  <div className="mt-3 text-right text-sm text-slate-400">
                    Total: <span className="font-semibold text-slate-200">
                      ${lines.reduce((s, l) => s + (Number(l.quantity) || 0) * (parseFloat(l.unit_cost) || 0), 0)
                        .toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-slate-800 flex gap-3 flex-shrink-0">
                <button type="submit" disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-400 disabled:bg-cyan-500/40 text-slate-950 font-semibold rounded-xl py-2.5 transition-colors">
                  {saving ? <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg> : null}
                  Create Purchase Order
                </button>
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl py-2.5 transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
