export default function InsightsPanel({ items }) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl shadow-slate-950/20">
      <div className="mb-6">
        <p className="text-sm uppercase tracking-[0.18em] text-slate-500">AI Insights</p>
        <h2 className="mt-3 text-xl font-semibold text-slate-100">Restock Alerts</h2>
      </div>
      <div className="space-y-4">
        {items.length > 0 ? (
          items.map((item) => (
            <div key={item.id} className="rounded-3xl border border-slate-800 bg-slate-950 p-4">
              <p className="text-sm text-slate-400">{item.name}</p>
              <p className="mt-2 text-lg font-semibold text-slate-100">Only {item.stock_count} left</p>
              <p className="mt-1 text-xs uppercase tracking-[0.18em] text-rose-300">{item.velocity_status} velocity</p>
            </div>
          ))
        ) : (
          <p className="text-slate-400">All tracked inventory levels are healthy.</p>
        )}
      </div>
    </div>
  );
}
