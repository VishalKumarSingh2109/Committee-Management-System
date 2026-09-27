export default function Loader({ label = 'Loading…' }) {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-ink/50">
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-ink/20 border-t-gold" />
      <span className="text-sm">{label}</span>
    </div>
  );
}
