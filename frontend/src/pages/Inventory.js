import { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getItems, getCategories, deleteItem } from '../api/inventory';

const VELOCITY_COLORS = {
  fast:   'bg-emerald-500/15 text-emerald-300',
  medium: 'bg-amber-500/15 text-amber-300',
  slow:   'bg-rose-500/15 text-rose-300',
};

function SortIcon({ dir }) {
  if (!dir) return <span className="text-slate-600 ml-1">↕</span>;
  return <span className="text-cyan-400 ml-1">{dir === 'asc' ? '↑' : '↓'}</span>;
}

export default function Inventory() {
  const navigate = useNavigate();
  const [items, setItems]               = useState([]);
  const [categories, setCategories]     = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [filterCat, setFilterCat]       = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sort, setSort]                 = useState({ col: 'name', dir: 'asc' });
  const [deletingId, setDeletingId]     = useState(null);

  useEffect(() => {
    Promise.all([getItems(), getCategories()])
      .then(([i, c]) => { setItems(i); setCategories(c); })
      .finally(() => setLoading(false));
  }, []);

  const catName = (id) => categories.find((c) => c.id === id)?.name ?? '—';

  const stockStatus = (item) => {
    const min = item.min_stock ?? 10;
    if (item.stock_count === 0)         return { label: 'Out of Stock', cls: 'bg-rose-500/15 text-rose-300' };
    if (item.stock_count < min)         return { label: 'Low Stock',    cls: 'bg-amber-500/15 text-amber-300' };
    return                                     { label: 'In Stock',     cls: 'bg-emerald-500/15 text-emerald-300' };
  };

  const handleSort = (col) => {
    setSort((prev) =>
      prev.col === col
        ? { col, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { col, dir: 'asc' }
    );
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    setDeletingId(id);
    await deleteItem(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
    setDeletingId(null);
  };

  const filtered = useMemo(() => {
    let result = [...items];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (i) => i.name.toLowerCase().includes(q) || String(i.id).includes(q)
      );
    }
    if (filterCat)               result = result.filter((i) => i.category_id === Number(filterCat));
    if (filterStatus === 'low')  result = result.filter((i) => i.stock_count > 0 && i.stock_count < 10);
    if (filterStatus === 'out')  result = result.filter((i) => i.stock_count === 0);
    if (filterStatus === 'ok')   result = result.filter((i) => i.stock_count >= 10);

    result.sort((a, b) => {
      let av = a[sort.col], bv = b[sort.col];
      if (typeof av === 'string') av = av.toLowerCase();
      if (typeof bv === 'string') bv = bv.toLowerCase();
      if (av < bv) return sort.dir === 'asc' ? -1 : 1;
      if (av > bv) return sort.dir === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [items, search, filterCat, filterStatus, sort]);

  // Th must be defined inside component to access handleSort + sort state
  const Th = ({ col, label }) => (
    <th
      className="px-4 py-3 text-left text-xs uppercase tracking-widest text-slate-500 font-medium cursor-pointer hover:text-slate-300 transition-colors select-none whitespace-nowrap"
      onClick={() => handleSort(col)}
    >
      {label}<SortIcon dir={sort.col === col ? sort.dir : null} />
    </th>
  );

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-100">Inventory</h1>
          <p className="text-sm text-slate-500 mt-1">
            {filtered.length} of {items.length} items
          </p>
        </div>
        <Link
          to="/inventory/new"
          className="flex-shrink-0 flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-sm rounded-xl px-3 sm:px-4 py-2.5 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="hidden sm:inline">Add Item</span>
          <span className="sm:hidden">Add</span>
        </Link>
      </div>

      {/* Filters — stack on mobile */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Live search — full width on mobile */}
        <div className="relative flex-1 min-w-0">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or ID…"
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-9 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/40 transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Dropdowns — side by side on mobile */}
        <div className="flex gap-3">
          <select
            value={filterCat}
            onChange={(e) => setFilterCat(e.target.value)}
            className="flex-1 sm:flex-none bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-cyan-500 transition-colors min-w-0"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="flex-1 sm:flex-none bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-cyan-500 transition-colors min-w-0"
          >
            <option value="">All Statuses</option>
            <option value="ok">In Stock</option>
            <option value="low">Low Stock</option>
            <option value="out">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-7 h-7 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-500">
            <svg className="w-10 h-10 mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-sm">No items match your filters</p>
            {(search || filterCat || filterStatus) && (
              <button
                onClick={() => { setSearch(''); setFilterCat(''); setFilterStatus(''); }}
                className="mt-2 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b border-slate-800 bg-slate-900 sticky top-0 z-10">
                <tr>
                  <Th col="id"               label="ID" />
                  <Th col="name"             label="Name" />
                  <Th col="category_id"      label="Category" />
                  <Th col="stock_count"      label="Stock" />
                  <Th col="price"            label="Price" />
                  <Th col="location"         label="Location" />
                  <Th col="velocity_status"  label="Velocity" />
                  <th className="px-4 py-3 w-16" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => {
                  const status = stockStatus(item);
                  return (
                    <tr
                      key={item.id}
                      className="border-t border-slate-800 hover:bg-slate-800/50 transition-colors group"
                    >
                      <td className="px-4 py-3 text-slate-500 font-mono text-xs whitespace-nowrap">
                        #{item.id}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Link
                          to={`/inventory/${item.id}`}
                          className="font-medium text-slate-200 hover:text-cyan-400 transition-colors"
                        >
                          {item.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                        {catName(item.category_id)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${status.cls}`}>
                          {item.stock_count} — {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-300 whitespace-nowrap">
                        ${Number(item.unit_price ?? item.price ?? 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                        {item.location_name ?? item.location ?? '—'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${VELOCITY_COLORS[item.velocity_status] ?? ''}`}>
                          {item.velocity_status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => navigate(`/inventory/${item.id}`)}
                            className="text-slate-400 hover:text-cyan-400 transition-colors p-1"
                            title="Edit"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            disabled={deletingId === item.id}
                            className="text-slate-400 hover:text-rose-400 transition-colors disabled:opacity-40 p-1"
                            title="Delete"
                          >
                            {deletingId === item.id ? (
                              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
