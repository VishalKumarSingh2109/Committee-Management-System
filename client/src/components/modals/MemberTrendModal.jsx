import { useEffect, useState } from 'react';
import Modal from '../common/Modal';
import Loader from '../common/Loader';
import StatusBadge from '../common/StatusBadge';
import MemberTrendChart from '../charts/MemberTrendChart';
import { getMemberStatistics } from '../../services/statisticsService';
import { formatCurrency, formatDate, MONTH_NAMES } from '../../utils/formatters';

export default function MemberTrendModal({ memberId, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMemberStatistics(memberId)
      .then((res) => setData(res.data.data))
      .finally(() => setLoading(false));
  }, [memberId]);

  return (
    <Modal title={loading ? 'Loading…' : data.member.name} onClose={onClose} width="max-w-2xl">
      {loading ? (
        <Loader />
      ) : (
        <>
          <div className="grid grid-cols-4 gap-3 text-xs">
            <div className="rounded-md bg-ink/5 p-3">
              <p className="text-ink/50">Total Paid</p>
              <p className="mt-1 font-medium text-emerald-700">{formatCurrency(data.totalPaid)}</p>
            </div>
            <div className="rounded-md bg-ink/5 p-3">
              <p className="text-ink/50">Total Due</p>
              <p className="mt-1 font-medium text-rose-700">{formatCurrency(data.totalDue)}</p>
            </div>
            <div className="rounded-md bg-ink/5 p-3">
              <p className="text-ink/50">Months Paid</p>
              <p className="mt-1 font-medium text-ink">{data.paidMonths}</p>
            </div>
            <div className="rounded-md bg-ink/5 p-3">
              <p className="text-ink/50">Months Due</p>
              <p className="mt-1 font-medium text-ink">{data.dueMonths}</p>
            </div>
          </div>

          {data.trend.length > 0 && (
            <div className="mt-5">
              <h4 className="font-serif text-base text-ink">Payment Trend</h4>
              <div className="mt-2">
                <MemberTrendChart trend={data.trend} />
              </div>
            </div>
          )}

          <div className="mt-5 border-t border-line pt-4">
            <h4 className="font-serif text-base text-ink">All Records</h4>
            {data.trend.length === 0 ? (
              <p className="mt-2 text-sm text-ink/40">No payment records yet.</p>
            ) : (
              <table className="mt-2 w-full text-sm">
                <tbody>
                  {[...data.trend].reverse().map((t, i) => (
                    <tr key={i} className="border-b border-line last:border-0">
                      <td className="py-2 text-ink">
                        {MONTH_NAMES[t.month - 1]} {t.year}
                      </td>
                      <td className="py-2 text-ink/70">{formatCurrency(t.amount)}</td>
                      <td className="py-2">
                        <StatusBadge status={t.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </Modal>
  );
}
