export default function StatCard({ label, value, hint, accent = 'ink' }) {
  const accents = {
    ink: 'text-ink',
    gold: 'text-gold',
    green: 'text-emerald-600',
    red: 'text-rose-600',
  };

  return (
    <div className="rounded-lg border border-line bg-white p-5">
      <p className="text-sm text-ink/60">{label}</p>
      <p className={`mt-2 font-serif text-3xl ${accents[accent] || accents.ink}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-ink/40">{hint}</p>}
    </div>
  );
}
