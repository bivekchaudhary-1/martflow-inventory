import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getItemById, createItem, updateItem, getCategories, getLocations, getSuppliers } from '../api/supabase';

const EMPTY = {
  name: '', sku: '', category_id: '', location_id: '', supplier_id: '',
  stock_count: '', min_stock: '10', unit_price: '', cost_price: '',
  velocity_status: 'medium', unit: 'pcs', notes: '',
};

const inputCls = "w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/40 transition-colors text-sm";
const labelCls = "block text-xs uppercase tracking-widest text-slate-500 mb-2";

export default function ItemDetail() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const isNew    = id === 'new';

  const [form, setForm]             = useState(EMPTY);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations]   = useState([]);
  const [suppliers, setSuppliers]   = useState([]);
  const [loading, setLoading]       = useState(!isNew);
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState('');

  useEffect(() => {
    // Load reference data in parallel
    Promise.all([getCategories(), getLocations(), getSuppliers()])
      .then(([c, l, s]) => { setCategories(c); setLocations(l); setSuppliers(s); });

    if (!isNew) {
      getItemById(id)
        .then((item) => {
          if (!item) { navigate('/inventory'); return; }
          setForm({
            name:            item.name            ?? '',
            sku:             item.sku              ?? '',
            category_id:     item.category_id      ?? '',
            location_id:     item.location_id      ?? '',
            supplier_id:     item.supplier_id      ?? '',
            stock_count:     item.stock_count      ?? 0,
            min_stock:       item.min_stock        ?? 10,
            unit_price:      item.unit_price       ?? '',
            cost_price:      item.cost_price       ?? '',
            velocity_status: item.velocity_status  ?? 'medium',
            unit:            item.unit             ?? 'pcs',
            notes:           item.notes            ?? '',
          });
        })
        .finally(() => setLoading(false));
    }
  }, [id, isNew, navigate]);

  const set = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    setSaving(true);

    // Build payload — only send fields that have values, coerce numbers
    const payload = {
      name:            form.name,
      sku:             form.sku || null,
      category_id:     form.category_id  ? Number(form.category_id)  : null,
      location_id:     form.location_id  ? Number(form.location_id)  : null,
      supplier_id:     form.supplier_id  ? Number(form.supplier_id)  : null,
      stock_count:     Number(form.stock_count),
      min_stock:       Number(form.min_stock),
      unit_price:      parseFloat(form.unit_price) || 0,
      cost_price:      form.cost_price ? parseFloat(form.cost_price) : null,
      velocity_status: form.velocity_status,
      unit:            form.unit || 'pcs',
      notes:           form.notes || null,
    };

    try {
      if (isNew) {
        const created = await createItem(payload);
        setSuccess('Item created.');
        setTimeout(() => navigate(`/inventory/${created.id}`), 600);
      } else {
        await updateItem(id, payload);
        setSuccess('Changes saved.');
        setTimeout(() => setSuccess(''), 2500);
      }
    } catch (err) {
      setError(err.message ?? 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"/>
    </div>
  );

  return (
    <div className="max-w-2xl w-full space-y-5 sm:space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500">
        <Link to="/inventory" className="hover:text-slate-300 transition-colors">Inventory</Link>
        <span>/</span>
        <span className="text-slate-300 truncate">{isNew ? 'New Item' : form.name || `Item #${id}`}</span>
      </nav>

      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-slate-100">{isNew ? 'Add New Item' : 'Edit Item'}</h1>
        <p className="text-sm text-slate-500 mt-1">{isNew ? 'Fill in the details below' : `SKU: ${form.sku || '—'} · ID #${id}`}</p>
      </div>

      {error   && <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 px-4 py-3 text-sm text-rose-300">{error}</div>}
      {success && <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-sm text-emerald-300">{success}</div>}

      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-5">

        {/* Name + SKU */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className={labelCls}>Item Name *</label>
            <input type="text" name="name" value={form.name} onChange={set} required placeholder='e.g. MacBook Pro 14"' className={inputCls}/>
          </div>
          <div>
            <label className={labelCls}>SKU</label>
            <input type="text" name="sku" value={form.sku} onChange={set} placeholder="SKU-001" className={inputCls}/>
          </div>
        </div>

        {/* Category + Location + Supplier */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelCls}>Category</label>
            <select name="category_id" value={form.category_id} onChange={set} className={inputCls}>
              <option value="">— Select —</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Location</label>
            <select name="location_id" value={form.location_id} onChange={set} className={inputCls}>
              <option value="">— Select —</option>
              {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Supplier</label>
            <select name="supplier_id" value={form.supplier_id} onChange={set} className={inputCls}>
              <option value="">— Select —</option>
              {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>

        {/* Stock + Min Stock + Unit */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className={labelCls}>Stock *</label>
            <input type="number" name="stock_count" value={form.stock_count} onChange={set} required min="0" placeholder="0" className={inputCls}/>
          </div>
          <div>
            <label className={labelCls}>Min Stock</label>
            <input type="number" name="min_stock" value={form.min_stock} onChange={set} min="0" placeholder="10" className={inputCls}/>
          </div>
          <div>
            <label className={labelCls}>Unit Price *</label>
            <input type="number" name="unit_price" value={form.unit_price} onChange={set} required min="0" step="0.01" placeholder="0.00" className={inputCls}/>
          </div>
          <div>
            <label className={labelCls}>Cost Price</label>
            <input type="number" name="cost_price" value={form.cost_price} onChange={set} min="0" step="0.01" placeholder="0.00" className={inputCls}/>
          </div>
        </div>

        {/* Velocity + Unit */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Velocity</label>
            <select name="velocity_status" value={form.velocity_status} onChange={set} className={inputCls}>
              <option value="fast">Fast</option>
              <option value="medium">Medium</option>
              <option value="slow">Slow</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Unit</label>
            <select name="unit" value={form.unit} onChange={set} className={inputCls}>
              {['pcs','kg','m','ream','set','box','litre'].map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className={labelCls}>Notes</label>
          <textarea name="notes" value={form.notes} onChange={set} rows={2} placeholder="Optional notes…"
            className={`${inputCls} resize-none`}/>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 disabled:bg-cyan-500/40 disabled:cursor-not-allowed text-slate-950 font-semibold rounded-xl px-5 sm:px-6 py-2.5 transition-colors">
            {saving ? (
              <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>Saving…</>
            ) : isNew ? 'Create Item' : 'Save Changes'}
          </button>
          <Link to="/inventory" className="text-sm text-slate-400 hover:text-slate-200 transition-colors px-4 py-2.5">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
