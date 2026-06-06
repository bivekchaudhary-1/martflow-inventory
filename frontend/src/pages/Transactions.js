import { useEffect, useState } from 'react';
import { getTransactions, createTransaction, getItems } from '../api/supabase';

const TYPE_STYLES = {
  adjustment: 'bg-cyan-500/15 text-cyan-300',
  receipt:    'bg-emerald-500/15 text-emerald-300',
  sale:       'bg-violet-500/15 text-violet-300',
  transfer:   'bg-amber-500/15 text-amber-300',
  damage:     'bg-rose-500/15 text-rose-300',
};

export default function Transactions() {
  const [transactions, setTrans] = useState([]);
  const [items, setItems]        = useState([]);
  const [loading, setLoading]    = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving]      = useState(false);
  const [form, setForm] = useState({ item_id: '', type: 'adjustment', quantity: '', reason: '' });

  useEffect(() => {
    Promise.all([getTransactions(), getItems()])
      .then(([t, i]) => { setTrans(t); setItems(i); })
      .finally(() => setLoading(false));
  }, []);

  const itemName = (id) => items.find(i => i.id === Number(id))?.name ?? `#${id}`;

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const item = items.find(i => i.id === Number(form.item_id));
      const qty  = Number(form.quantity);
      const before = item?.stock_count ?? 0;
      const delta  = form.type === 'sale' || form.type === 'damage' ? -qty : qty;
      const after  = Math.max(0, before + delta);
      const t = await createTransaction({
        item_id:         Number(form.item_id),
        type:            form.type,
        quantity:        qty,
        quantity_before: before,
        quantity_after:  after,
        reason:          form.reason,
        created_at:      new Date().toISOString(),
      });
      setTrans(prev => [t, ...prev]);
      // Update local item stock
      setItems(prev => prev.map(i => i.id === Number(form.item_id) ? { ...i, stock_count: after } : i));
      setShowModal(false);
      setForm({ item_id: '', type: 'adjustment', quantity: '', reason: '' });
    } finally { setSaving(false); }
  };

  const inputCls = "w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/40 transition-colors";
  const labelCls = "block text-xs uppercase tracking-widest text-slate-500 mb-2";

  function fmt(ts) {
    try { return new Intl.DateTimeFormat('en-US', { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit', hour12:false }).format(new Date(ts)); }
    catch { return ts ?? '—'; }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-100">Stock Transactions</h1>
          <p className="text-sm text-slate-500 mt-1">{transactions.length} records</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex-shrink-0 flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-sm rounded-xl px-4 py-2.5 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
          </svg>
          <span className="hidden sm:inline">Adjust Stock</span>
          <span className="sm:hidden">Adjust</span>
        </button>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-7 h-7 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"/>
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-500">
            <svg className="w-10 h-10 mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
            <p className="text-sm">No transactions yet — make a stock adjustment to start tracking</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b border-slate-800">
                <tr className="text-xs uppercase tracking-widest text-slate-500">
                  <th className="px-4 sm:px-6 py-3 text-left font-medium whitespace-nowrap">Item</th>
                  <th className="px-4 sm:px-6 py-3 text-left font-medium whitespace-nowrap">Type</th>
                  <th className="px-4 sm:px-6 py-3 text-left font-medium whitespace-nowrap">Before</th>
                  <th className="px-4 sm:px-6 py-3 text-left font-medium whitespace-nowrap">Change</th>
                  <th className="px-4 sm:px-6 py-3 text-left font-medium whitespace-nowrap">After</th>
                  <th className="px-4 sm:px-6 py-3 text-left font-medium whitespace-nowrap">Reason</th>
                  <th className="px-4 sm:px-6 py-3 text-left font-medium whitespace-nowrap">Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(t => {
                  const delta = (t.quantity_after ?? 0) - (t.quantity_before ?? 0);
                  return (
                    <tr key={t.id} className="border-t border-slate-800 hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 sm:px-6 py-3 font-medium text-slate-200 whitespace-nowrap">
                        {t.items?.name ?? itemName(t.item_id)}
                      </td>
                      <td className="px-4 sm:px-6 py-3 whitespace-nowrap">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${TYPE_STYLES[t.type] ?? 'bg-slate-700 text-slate-300'}`}>
                          {t.type}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-3 text-slate-400 whitespace-nowrap">{t.quantity_before ?? '—'}</td>
                      <td className="px-4 sm:px-6 py-3 whitespace-nowrap">
                        <span className={`font-semibold ${delta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {delta >= 0 ? '+' : ''}{delta}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-3 text-slate-200 whitespace-nowrap font-medium">{t.quantity_after ?? '—'}</td>
                      <td className="px-4 sm:px-6 py-3 text-slate-400 max-w-[12rem] truncate">{t.reason ?? '—'}</td>
                      <td className="px-4 sm:px-6 py-3 text-slate-500 whitespace-nowrap text-xs">{fmt(t.created_at)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
            <h2 className="text-lg font-semibold text-slate-100 mb-5">Stock Adjustment</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className={labelCls}>Item</label>
                <select value={form.item_id} onChange={e => setForm(p => ({ ...p, item_id: e.target.value }))} required className={inputCls}>
                  <option value="">Select item…</option>
                  {items.map(i => <option key={i.id} value={i.id}>{i.name} (stock: {i.stock_count})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Type</label>
                  <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} className={inputCls}>
                    <option value="adjustment">Adjustment</option>
                    <option value="receipt">Receipt</option>
                    <option value="sale">Sale</option>
                    <option value="transfer">Transfer</option>
                    <option value="damage">Damage</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Quantity</label>
                  <input type="number" min="1" value={form.quantity} onChange={e => setForm(p => ({ ...p, quantity: e.target.value }))} required placeholder="0" className={inputCls}/>
                </div>
              </div>
              <div>
                <label className={labelCls}>Reason</label>
                <input type="text" value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))} placeholder="e.g. Found extra units in storage" className={inputCls}/>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-400 disabled:bg-cyan-500/40 text-slate-950 font-semibold rounded-xl py-2.5 transition-colors">
                  {saving ? <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg> : 'Record'}
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
