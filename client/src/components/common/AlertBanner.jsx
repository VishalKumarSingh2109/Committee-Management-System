import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

const TONES = {
  warning: {
    wrap: 'border-amber-200 bg-amber-50',
    icon: 'text-amber-600',
    title: 'text-amber-900',
    desc: 'text-amber-700',
    button: 'bg-amber-600 hover:bg-amber-700',
  },
  danger: {
    wrap: 'border-rose-200 bg-rose-50',
    icon: 'text-rose-600',
    title: 'text-rose-900',
    desc: 'text-rose-700',
    button: 'bg-rose-600 hover:bg-rose-700',
  },
};

export default function AlertBanner({ tone = 'warning', title, description, actionLabel, actionTo }) {
  const style = TONES[tone] || TONES.warning;

  return (
    <div className={`flex flex-wrap items-center justify-between gap-4 rounded-lg border px-5 py-4 ${style.wrap}`}>
      <div className="flex items-start gap-3">
        <AlertTriangle size={20} className={`mt-0.5 shrink-0 ${style.icon}`} />
        <div>
          <p className={`text-sm font-medium ${style.title}`}>{title}</p>
          {description && <p className={`mt-0.5 text-sm ${style.desc}`}>{description}</p>}
        </div>
      </div>
      {actionLabel && actionTo && (
        <Link
          to={actionTo}
          className={`shrink-0 rounded-md px-4 py-2 text-sm font-medium text-white transition ${style.button}`}
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
