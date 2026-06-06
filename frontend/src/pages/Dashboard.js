import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardStats, getCategories, getLowStockItems } from '../api/supabase';

const EMPTY_STATS = {
  total_items: 0, total_categories: 0, total_locations: 0, total_suppliers: 0,
  total_stock_value: 0, low_stock_count: 0, out_of_stock_count: 0,
  active_alerts: 0, transactions_today: 0,
  items_by_velocity: { fast: 0, medium: 0, slow: 0 },
  items_by_category: [],
  totalItems: 0, totalQuantity: 0, lowStockCount: 0, totalLocations: 0, totalValue: 0,
  recentItems: [], lowStockItems: [],
};

function KPI({ label, value, sub, icon, color }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-5 flex items-start gap-3 sm:gap-4">
      <div className={`flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center ${color}`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-widest text-slate-500 truncate">{label}</p>
        <p className="mt-1 text-xl sm:text-2xl font-semibold text-slate-100 truncate">{value}</p>
        {sub && <p className="mt-0.5 text-xs text-slate-500">{sub}</p>}
      </div>
    </div>
  );
}

function StockPill({ count, min = 10 }) {
  if (count === 0)    return <span className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium bg-rose-500/15 text-rose-300">0 — Out</span>;
  if (count < min)    return <span className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium bg-amber-500/15 text-amber-300">{count} — Low</span>;
  return                     <span className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium bg-emerald-500/15 text-emerald-300">{count}</span>;
}

function VelocityBar({ data }) {
  const total = (data?.fast ?? 0) + (data?.medium ?? 0) + (data?.slow ?? 0);
  if (!total) return null;
  const pct = (n) => `${Math.round((n / total) * 100)}%`;
  return (
    <div className="space-y-2">
      {[['fast', 'bg-emerald-500', 'Fast', data?.fast], ['medium', 'bg-amber-500', 'Medium', data?.medium], ['slow', 'bg-rose-500', 'Slow', data?.slow]].map(([k, color, label, count]) => (
        <div key={k} className="flex items-center gap-3">
          <span className="w-14 text-xs text-slate-500 text-right flex-shrink-0">{label}</span>
          <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
            <div className={`h-full rounded-full ${color}`} style={{ width: pct(count ?? 0) }} />
          </div>
          <span className="w-8 text-xs text-slate-400 flex-shrink-0">{count ?? 0}</span>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats]           = useState(null);
  const [categories, setCategories] = useState([]);
  const [lowStock, setLowStock]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');

  useEffect(() => {
    Promise.all([getDashboardStats(), getCategories(), getLowStockItems()])
      .then(([s, c, ls]) => {
        setStats(s ?? EMPTY_STATS);
        setCategories(c ?? []);
        setLowStock((ls ?? []).slice(0, 5));
      })
      .catch((err) => {
        console.error('Dashboard load error:', err);
        setError(err.message ?? 'Failed to load dashboard data.');
        setStats(EMPTY_STATS);
      })
      .finally(() => setLoading(false));
  }, []);

  const catName = (id) => categories.find(c => c.id === id)?.name ?? '—';

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"/>
    </div>
  );

  const fmt$ = (v) => `$${Number(v ?? 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-slate-100">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Live overview of your inventory</p>
      </div>

      {/* KPIs — 6 cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <KPI label="Items"       value={stats.total_items ?? stats.totalItems}        color="bg-cyan-500/15 text-cyan-400"
          icon={<svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>} />
        <KPI label="Categories"  value={stats.total_categories ?? categories.length}  color="bg-violet-500/15 text-violet-400"
          icon={<svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/></svg>} />
        <KPI label="Locations"   value={stats.total_locations ?? stats.totalLocations} color="bg-blue-500/15 text-blue-400"
          icon={<svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>} />
        <KPI label="Suppliers"   value={stats.total_suppliers ?? '—'}                 color="bg-indigo-500/15 text-indigo-400"
          icon={<svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>} />
        <KPI label="Low Stock"   value={stats.low_stock_count ?? stats.lowStockCount}  color="bg-rose-500/15 text-rose-400"
          icon={<svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>} />
        <KPI label="Total Value" value={fmt$(stats.total_stock_value ?? stats.totalValue)} color="bg-emerald-500/15 text-emerald-400"
          icon={<svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>} />
      </div>

      {/* 3-column middle section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Recent Items table */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden">
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-800">
            <h2 className="text-sm font-semibold text-slate-200">Recent Items</h2>
            <Link to="/inventory" className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors">View all →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-widest text-slate-500 border-b border-slate-800">
                  {['Name','Category','Stock','Location'].map(h => (
                    <th key={h} className="px-4 sm:px-6 py-3 text-left font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(stats.recentItems ?? []).map(item => (
                  <tr key={item.id} className="border-t border-slate-800 hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 sm:px-6 py-3">
                      <Link to={`/inventory/${item.id}`} className="font-medium text-slate-200 hover:text-cyan-400 transition-colors whitespace-nowrap">{item.name}</Link>
                    </td>
                    <td className="px-4 sm:px-6 py-3 text-slate-400 whitespace-nowrap">{item.category_name ?? catName(item.category_id)}</td>
                    <td className="px-4 sm:px-6 py-3 whitespace-nowrap"><StockPill count={item.stock_count} min={item.min_stock}/></td>
                    <td className="px-4 sm:px-6 py-3 text-slate-400 whitespace-nowrap">{item.location_name ?? item.location}</td>
                  </tr>
                ))}
                {(stats.recentItems ?? []).length === 0 && (
                  <tr><td colSpan={4} className="px-6 py-8 text-center text-sm text-slate-500">No items yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right column: alerts + velocity */}
        <div className="space-y-4">
          {/* Restock Alerts */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-200">Restock Alerts</h2>
                <p className="text-xs text-slate-500 mt-0.5">Below min stock</p>
              </div>
              {(stats.active_alerts > 0) && (
                <span className="bg-rose-500/15 text-rose-300 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                  {stats.active_alerts}
                </span>
              )}
            </div>
            <div className="divide-y divide-slate-800">
              {lowStock.length === 0 ? (
                <p className="px-4 sm:px-6 py-4 text-sm text-slate-500">All levels healthy ✓</p>
              ) : lowStock.map(item => (
                <div key={item.id} className="px-4 sm:px-6 py-3 hover:bg-slate-800/50 transition-colors">
                  <Link to={`/inventory/${item.id}`} className="text-sm font-medium text-slate-200 hover:text-cyan-400 transition-colors block truncate">{item.name}</Link>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-slate-500 truncate mr-2">{item.location_name ?? item.location}</span>
                    <span className="text-xs font-semibold text-rose-300 flex-shrink-0">{item.stock_count} left</span>
                  </div>
                  <div className="mt-1.5 h-1 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full rounded-full bg-rose-500" style={{ width: `${Math.min((item.stock_count / (item.min_stock ?? 10)) * 100, 100)}%` }}/>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Velocity breakdown */}
          {stats.items_by_velocity && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-5">
              <h2 className="text-sm font-semibold text-slate-200 mb-4">Velocity Breakdown</h2>
              <VelocityBar data={stats.items_by_velocity} />
            </div>
          )}
        </div>
      </div>

      {/* Category breakdown */}
      {(stats.items_by_category ?? []).length > 0 && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-slate-800">
            <h2 className="text-sm font-semibold text-slate-200">By Category</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-widest text-slate-500 border-b border-slate-800">
                  {['Category','Items','Value'].map(h => (
                    <th key={h} className="px-4 sm:px-6 py-3 text-left font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.items_by_category.map((row, i) => (
                  <tr key={i} className="border-t border-slate-800 hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 sm:px-6 py-3 font-medium text-slate-200">{row.name}</td>
                    <td className="px-4 sm:px-6 py-3 text-slate-400">{row.count}</td>
                    <td className="px-4 sm:px-6 py-3 text-slate-300">{fmt$(row.value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
