export default function KPICard({ label, value, accent }) {
  return (
    <div className={`rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl shadow-slate-950/20 ${accent}`}>
      <p className="text-sm uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-4 text-3xl font-semibold text-slate-100">{value}</p>
    </div>
  );
}
