import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { QrCode } from 'lucide-react';
import { getOwnMember } from '../../services/memberService';
import { getMemberPayments } from '../../services/paymentService';
import Loader from '../../components/common/Loader';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import AlertBanner from '../../components/common/AlertBanner';
import { formatCurrency, formatDate, MONTH_NAMES } from '../../utils/formatters';

export default function MemberDashboard() {
  const [member, setMember] = useState(null);
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const memberRes = await getOwnMember();
        const m = memberRes.data.data;
        setMember(m);

        const paymentsRes = await getMemberPayments(m.id);
        setHistory(paymentsRes.data.data);
      } catch (err) {
        setErrorMsg(err.response?.data?.message || 'Could not load your dashboard.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <Loader label="Loading your dashboard…" />;
  if (errorMsg) return <div className="p-8 text-sm text-rose-600">{errorMsg}</div>;

  const now = new Date();
  const currentMonthPayment = history.payments.find(
    (p) => p.month === now.getMonth() + 1 && p.year === now.getFullYear()
  );

  return (
    <div className="space-y-8 p-6 md:p-8">
      <div>
        <h1 className="font-serif text-2xl text-ink">Welcome, {member.name}</h1>
        <p className="mt-1 text-sm text-ink/50">
          {MONTH_NAMES[now.getMonth()]} {now.getFullYear()}
        </p>
      </div>

      {history.summary.monthsDue > 0 && (
        <AlertBanner
          tone={history.summary.monthsDue > 1 ? 'danger' : 'warning'}
          title={`You have ${history.summary.monthsDue} month${history.summary.monthsDue > 1 ? 's' : ''} due`}
          description={`Totaling ${formatCurrency(history.summary.totalDue)} outstanding.`}
          actionLabel="Pay Now"
          actionTo="/member/pay"
        />
      )}

      {/* Current month status */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-line bg-white p-5">
        <div>
          <p className="text-sm text-ink/50">This month's dues</p>
          <p className="mt-1 font-serif text-2xl text-ink">{formatCurrency(member.monthly_fee)}</p>
        </div>
        <div className="flex items-center gap-4">
          <StatusBadge status={currentMonthPayment?.status || 'due'} />
          {currentMonthPayment?.status !== 'paid' && (
            <Link
              to="/member/pay"
              className="flex items-center gap-2 rounded-md bg-ink px-4 py-2 text-sm font-medium text-paper transition hover:bg-ink-light"
            >
              <QrCode size={16} />
              Pay Now
            </Link>
          )}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Paid" value={formatCurrency(history.summary.totalPaid)} accent="green" />
        <StatCard label="Total Due" value={formatCurrency(history.summary.totalDue)} accent="red" />
        <StatCard label="Months Paid" value={history.summary.monthsPaid} />
        <StatCard label="Months Due" value={history.summary.monthsDue} accent="gold" />
      </div>

      {/* Recent history */}
      <div className="rounded-lg border border-line bg-white">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-serif text-lg text-ink">Recent Payments</h2>
          <Link to="/member/history" className="text-sm text-gold hover:underline">
            View all
          </Link>
        </div>
        {history.payments.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-ink/40">No payment records yet.</p>
        ) : (
          <table className="w-full text-sm">
            <tbody>
              {history.payments.slice(0, 5).map((p) => (
                <tr key={p.id} className="border-b border-line last:border-0">
                  <td className="px-5 py-3 text-ink">
                    {MONTH_NAMES[p.month - 1]} {p.year}
                  </td>
                  <td className="px-5 py-3 text-ink/70">{formatCurrency(p.amount)}</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="px-5 py-3 text-ink/50">{formatDate(p.payment_date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
