import { useEffect, useState } from 'react';
import { getPaymentsDirectory } from '../../services/paymentService';
import Loader from '../../components/common/Loader';
import StatusBadge from '../../components/common/StatusBadge';
import { MONTH_NAMES } from '../../utils/formatters';

const now = new Date();
const YEAR_OPTIONS = [now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1];

export default function AllMembersStatus() {
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    setLoading(true);
    getPaymentsDirectory(month, year)
      .then((res) => setMembers(res.data.data.members))
      .catch((err) => setErrorMsg(err.response?.data?.message || 'Could not load member statuses.'))
      .finally(() => setLoading(false));
  }, [month, year]);

  const paidCount = members.filter((m) => m.status === 'paid').length;

  return (
    <div className="space-y-6 p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl text-ink">All Members</h1>
          <p className="mt-1 text-sm text-ink/50">
            {members.length > 0 ? `${paidCount} of ${members.length} paid` : 'Who has paid this month'}
          </p>
        </div>

        <div className="flex gap-3">
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="rounded-md border border-line bg-white px-3 py-2 text-sm outline-none focus:border-gold"
          >
            {MONTH_NAMES.map((name, i) => (
              <option key={name} value={i + 1}>
                {name}
              </option>
            ))}
          </select>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="rounded-md border border-line bg-white px-3 py-2 text-sm outline-none focus:border-gold"
          >
            {YEAR_OPTIONS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-lg border border-line bg-white">
        {loading ? (
          <Loader label="Loading…" />
        ) : errorMsg ? (
          <p className="px-5 py-10 text-center text-sm text-rose-600">{errorMsg}</p>
        ) : members.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-ink/40">No members found.</p>
        ) : (
          <ul className="divide-y divide-line">
            {members.map((m) => (
              <li key={m.member_id} className="flex items-center justify-between px-5 py-3.5">
                <span className="text-sm text-ink">{m.name}</span>
                <StatusBadge status={m.status} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
