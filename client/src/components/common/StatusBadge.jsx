const STYLES = {
  paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  due: 'bg-rose-50 text-rose-700 border-rose-200',
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  inactive: 'bg-slate-100 text-slate-500 border-slate-200',
};

const LABELS = {
  paid: 'Paid',
  due: 'Due',
  pending: 'Pending',
  active: 'Active',
  inactive: 'Inactive',
};

export default function StatusBadge({ status }) {
  const style = STYLES[status] || STYLES.due;
  const label = LABELS[status] || status;

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${style}`}>
      {label}
    </span>
  );
}
