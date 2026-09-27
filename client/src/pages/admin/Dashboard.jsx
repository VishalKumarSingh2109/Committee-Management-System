import { useEffect, useState } from 'react';
import { getSummary, getMonthlyStatistics } from '../../services/statisticsService';
import { getPayments } from '../../services/paymentService';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import Loader from '../../components/common/Loader';
import AlertBanner from '../../components/common/AlertBanner';
import CollectionBarChart from '../../components/charts/CollectionBarChart';
import PaidDuePieChart from '../../components/charts/PaidDuePieChart';
import CollectionLineChart from '../../components/charts/CollectionLineChart';
import { formatCurrency, formatDate, MONTH_NAMES } from '../../utils/formatters';

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [monthlyStats, setMonthlyStats] = useState(null);
  const [recentPayments, setRecentPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const year = new Date().getFullYear();
        const [summaryRes, monthlyRes, paymentsRes] = await Promise.all([
          getSummary(),
          getMonthlyStatistics(year),
          getPayments({ limit: 6 }),
        ]);
        setSummary(summaryRes.data.data);
        setMonthlyStats(monthlyRes.data.data);
        setRecentPayments(paymentsRes.data.data.payments);
      } catch (err) {
        setErrorMsg(err.response?.data?.message || 'Could not load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <Loader label="Loading dashboard…" />;

  if (errorMsg) {
    return <div className="p-8 text-sm text-rose-600">{errorMsg}</div>;
  }

  const monthLabel = MONTH_NAMES[summary.month - 1];

  return (
    <div className="space-y-8 p-6 md:p-8">
      <div>
        <h1 className="font-serif text-2xl text-ink">Dashboard</h1>
        <p className="mt-1 text-sm text-ink/50">
          Overview for {monthLabel} {summary.year}
        </p>
      </div>

      {summary.dueMembers > 0 && (
        <AlertBanner
          tone="warning"
          title={`${summary.dueMembers} member${summary.dueMembers > 1 ? 's have' : ' has'} unpaid dues for ${monthLabel} ${summary.year}`}
          description={`Totaling ${formatCurrency(summary.currentMonthDue)} outstanding.`}
          actionLabel="Review in Monthly Table"
          actionTo="/admin/monthly"
        />
      )}

      {/* Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard label="Total Members" value={summary.totalMembers} />
        <StatCard
          label="This Month's Collection"
          value={formatCurrency(summary.currentMonthCollection)}
          accent="green"
        />
        <StatCard label="This Month's Due" value={formatCurrency(summary.currentMonthDue)} accent="red" />
        <StatCard label="Paid Members" value={summary.paidMembers} accent="ink" />
        <StatCard label="Due Members" value={summary.dueMembers} accent="gold" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="rounded-lg border border-line bg-white p-5 lg:col-span-2">
          <h2 className="font-serif text-lg text-ink">Monthly Collection</h2>
          <p className="text-xs text-ink/40">{monthlyStats.year}</p>
          <div className="mt-2">
            <CollectionBarChart months={monthlyStats.months} />
          </div>
        </div>

        <div className="rounded-lg border border-line bg-white p-5">
          <h2 className="font-serif text-lg text-ink">Paid vs Due</h2>
          <p className="text-xs text-ink/40">Across {monthlyStats.year}</p>
          <div className="mt-2">
            <PaidDuePieChart paid={monthlyStats.paidVsDue.paid} due={monthlyStats.paidVsDue.due} />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-line bg-white p-5">
        <h2 className="font-serif text-lg text-ink">Collection Trend</h2>
        <p className="text-xs text-ink/40">{monthlyStats.year}</p>
        <div className="mt-2">
          <CollectionLineChart months={monthlyStats.months} />
        </div>
      </div>

      {/* Recent activity */}
      <div className="rounded-lg border border-line bg-white">
        <div className="border-b border-line px-5 py-4">
          <h2 className="font-serif text-lg text-ink">Recent Payment Activity</h2>
        </div>

        {recentPayments.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-ink/40">No payment activity yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink/40">
                  <th className="px-5 py-3 font-medium">Member</th>
                  <th className="px-5 py-3 font-medium">Month</th>
                  <th className="px-5 py-3 font-medium">Amount</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentPayments.map((p) => (
                  <tr key={p.id} className="border-b border-line last:border-0">
                    <td className="px-5 py-3 text-ink">{p.Member?.name}</td>
                    <td className="px-5 py-3 text-ink/70">
                      {MONTH_NAMES[p.month - 1]?.slice(0, 3)} {p.year}
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
          </div>
        )}
      </div>
    </div>
  );
}
