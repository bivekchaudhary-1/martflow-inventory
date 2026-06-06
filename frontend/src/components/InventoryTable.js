export default function InventoryTable({ items, categories }) {
  const findCategory = (id) => categories.find((category) => category.id === id)?.name ?? 'Unknown';

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950">
      <table className="min-w-full text-left text-sm text-slate-300">
        <thead className="bg-slate-900 text-slate-400">
          <tr>
            <th className="px-6 py-4">Product</th>
            <th className="px-6 py-4">Category</th>
            <th className="px-6 py-4">Stock</th>
            <th className="px-6 py-4">Location</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-t border-slate-800 hover:bg-slate-900/80">
              <td className="px-6 py-4 font-medium text-slate-100">{item.name}</td>
              <td className="px-6 py-4 text-slate-400">{findCategory(item.category_id)}</td>
              <td className="px-6 py-4">
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${item.stock_count < 10 ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                  {item.stock_count}
                </span>
              </td>
              <td className="px-6 py-4 text-slate-400">{item.location}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
