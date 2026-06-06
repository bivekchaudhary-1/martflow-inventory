import { useEffect, useState } from 'react';
import { getLocations, createLocation, updateLocation, deleteLocation } from '../api/supabase';

const EMPTY_FORM = { name: '', type: 'shelf', capacity: '', address: '', description: '' };

const TYPE_LABELS = { warehouse: 'Warehouse', shelf: 'Shelf', zone: 'Zone' };

const TYPE_COLORS = {
  warehouse: 'bg-cyan-500/15 text-cyan-300',
  shelf:     'bg-violet-500/15 text-violet-300',
  zone:      'bg-amber-500/15 text-amber-300',
};

const inputCls = "w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/40 transition-colors text-sm";
const labelCls = "block text-xs uppercase tracking-widest text-slate-500 mb-2";

export default function Locations() {
  const [locations, setLocations]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [editing, setEditing]       = useState(null);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [saving, setSaving]         = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch]         = useState('');

  useEffect(() => {
    getLocations().then(setLocations).finally(() => setLoading(false));
  }, []);

  const filtered = locations.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    (l.description ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit   = (loc) => {
    setEditing(loc);
    setForm({ name: loc.name, type: loc.type, capacity: loc.capacity ?? '', address: loc.address ?? '', description: loc.description ?? '' });
    setShowModal(true);
  };
  const closeModal = () => setShowModal(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, capacity: form.capacity ? Number(form.capacity) : null };
    try {
      if (editing) {
        const updated = await updateLocation(editing.id, payload);
        setLocations(prev => prev.map(l => l.id === editing.id ? updated : l));
      } else {
        const created = await createLocation(payload);
        setLocations(prev => [...prev, created]);
      }
      closeModal();
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this location? Items assigned here will be unlinked.')) return;
    setDeletingId(id);
    await deleteLocation(id);
    setLocations(prev => prev.filter(l => l.id !== id));
    setDeletingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-100">Locations</h1>
          <p className="text-sm text-slate-500 mt-1">{filtered.length} storage location{filtered.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={openCreate}
          className="flex-shrink-0 flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-sm rounded-xl px-4 py-2.5 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
          </svg>
          <span className="hidden sm:inline">Add Location</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search locations…"
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/40 transition-colors"/>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-7 h-7 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"/>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(loc => (
            <div key={loc.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-5 group">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-semibold text-slate-100 truncate">{loc.name}</h3>
                  <span className={`inline-flex mt-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${TYPE_COLORS[loc.type] ?? 'bg-slate-700 text-slate-300'}`}>
                    {TYPE_LABELS[loc.type] ?? loc.type}
                  </span>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button onClick={() => openEdit(loc)} className="p-1.5 rounded-lg text-slate-500 hover:text-cyan-400 hover:bg-slate-800 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    </svg>
                  </button>
                  <button onClick={() => handleDelete(loc.id)} disabled={deletingId === loc.id}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors disabled:opacity-40">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Capacity bar */}
              {loc.capacity && (
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                    <span>{loc.address ?? 'No address'}</span>
                    <span>Cap: {loc.capacity.toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-800"/>
                </div>
              )}

              {loc.description && (
                <p className="mt-3 text-xs text-slate-500 truncate">{loc.description}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
            <h2 className="text-lg font-semibold text-slate-100 mb-5">{editing ? 'Edit Location' : 'Add Location'}</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className={labelCls}>Name *</label>
                  <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    required placeholder="e.g. Shelf D-1" className={inputCls}/>
                </div>
                <div>
                  <label className={labelCls}>Type</label>
                  <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} className={inputCls}>
                    <option value="warehouse">Warehouse</option>
                    <option value="shelf">Shelf</option>
                    <option value="zone">Zone</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Capacity</label>
                  <input type="number" min="1" value={form.capacity} onChange={e => setForm(p => ({ ...p, capacity: e.target.value }))}
                    placeholder="e.g. 200" className={inputCls}/>
                </div>
                <div className="col-span-2">
                  <label className={labelCls}>Address</label>
                  <input type="text" value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
                    placeholder="e.g. Building 1, Aisle 4" className={inputCls}/>
                </div>
                <div className="col-span-2">
                  <label className={labelCls}>Description</label>
                  <input type="text" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                    placeholder="Optional description" className={inputCls}/>
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-400 disabled:bg-cyan-500/40 text-slate-950 font-semibold rounded-xl py-2.5 transition-colors">
                  {saving ? <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>
                    : editing ? 'Save Changes' : 'Create'}
                </button>
                <button type="button" onClick={closeModal}
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
