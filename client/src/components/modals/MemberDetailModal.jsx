import { useEffect, useState } from 'react';
import Modal from '../common/Modal';
import StatusBadge from '../common/StatusBadge';
import Loader from '../common/Loader';
import { getMemberPayments } from '../../services/paymentService';
import { formatCurrency, formatDate, MONTH_NAMES } from '../../utils/formatters';

export default function MemberDetailModal({ member, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMemberPayments(member.id)
      .then((res) => setData(res.data.data))
      .finally(() => setLoading(false));
  }, [member.id]);

  return (
    <Modal title={member.name} onClose={onClose} width="max-w-2xl">
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-ink/40">Email</p>
          <p className="text-ink">{member.email}</p>
        </div>
        <div>
          <p className="text-ink/40">Phone</p>
          <p className="text-ink">{member.phone}</p>
        </div>
        <div>
          <p className="text-ink/40">Join Date</p>
          <p className="text-ink">{formatDate(member.join_date)}</p>
        </div>
        <div>
          <p className="text-ink/40">Monthly Fee</p>
          <p className="text-ink">{formatCurrency(member.monthly_fee)}</p>
        </div>
        <div className="col-span-2">
          <p className="text-ink/40">Address</p>
          <p className="text-ink">{member.address || '—'}</p>
        </div>
      </div>

      <div className="mt-6 border-t border-line pt-5">
        <h4 className="font-serif text-base text-ink">Payment History</h4>

        {loading ? (
          <Loader label="Loading history…" />
        ) : data.payments.length === 0 ? (
          <p className="mt-3 text-sm text-ink/40">No payment records yet.</p>
        ) : (
          <>
            <div className="mt-3 grid grid-cols-4 gap-3 text-xs">
              <div className="rounded-md bg-ink/5 p-3">
                <p className="text-ink/50">Total Paid</p>
                <p className="mt-1 font-medium text-emerald-700">{formatCurrency(data.summary.totalPaid)}</p>
              </div>
              <div className="rounded-md bg-ink/5 p-3">
                <p className="text-ink/50">Total Due</p>
                <p className="mt-1 font-medium text-rose-700">{formatCurrency(data.summary.totalDue)}</p>
              </div>
              <div className="rounded-md bg-ink/5 p-3">
                <p className="text-ink/50">Months Paid</p>
                <p className="mt-1 font-medium text-ink">{data.summary.monthsPaid}</p>
              </div>
              <div className="rounded-md bg-ink/5 p-3">
                <p className="text-ink/50">Months Due</p>
                <p className="mt-1 font-medium text-ink">{data.summary.monthsDue}</p>
              </div>
            </div>

            <table className="mt-4 w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink/40">
                  <th className="py-2 font-medium">Month</th>
                  <th className="py-2 font-medium">Amount</th>
                  <th className="py-2 font-medium">Status</th>
                  <th className="py-2 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {data.payments.map((p) => (
                  <tr key={p.id} className="border-b border-line last:border-0">
                    <td className="py-2 text-ink">
                      {MONTH_NAMES[p.month - 1]?.slice(0, 3)} {p.year}
                    </td>
                    <td className="py-2 text-ink/70">{formatCurrency(p.amount)}</td>
                    <td className="py-2">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="py-2 text-ink/50">{formatDate(p.payment_date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </Modal>
  );
}
