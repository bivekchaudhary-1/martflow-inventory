const navItems = [
  { label: 'Dashboard', active: true },
  { label: 'Inventory', active: false },
  { label: 'Sales', active: false },
  { label: 'Settings', active: false },
];

export default function Sidebar() {
  return (
    <aside className="hidden w-72 shrink-0 border-r border-slate-800 bg-slate-950 p-6 text-slate-200 lg:block">
      <div className="mb-10">
        <div className="mb-4 rounded-3xl bg-slate-900 px-4 py-5 shadow-sm shadow-slate-950/40">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">MartFlow</p>
          <h1 className="mt-3 text-2xl font-semibold text-white">Inventory Hub</h1>
        </div>
      </div>
      <nav className="space-y-2">
        {navItems.map((item) => (
          <button
            key={item.label}
            className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition ${item.active ? 'bg-slate-800 text-white shadow-sm shadow-slate-950/20' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-100'}`}
          >
            <span>{item.label}</span>
            {item.active && <span className="rounded-full bg-slate-700 px-2 py-1 text-xs uppercase tracking-[0.18em] text-slate-300">current</span>}
          </button>
        ))}
      </nav>
    </aside>
  );
}
