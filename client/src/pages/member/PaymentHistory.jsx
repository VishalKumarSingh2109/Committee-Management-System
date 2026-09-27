import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Download } from 'lucide-react';
import { getOwnMember } from '../../services/memberService';
import { getMemberPayments, downloadReceipt } from '../../services/paymentService';
import Loader from '../../components/common/Loader';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import CollectionLineChart from '../../components/charts/CollectionLineChart';
import { formatCurrency, formatDate, MONTH_NAMES } from '../../utils/formatters';
import { downloadBlob } from '../../utils/download';

export default function PaymentHistory() {
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const memberRes = await getOwnMember();
        const res = await getMemberPayments(memberRes.data.data.id);
        setHistory(res.data.data);
      } catch (err) {
        setErrorMsg(err.response?.data?.message || 'Could not load your payment history.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <Loader label="Loading your history…" />;
  if (errorMsg) return <div className="p-8 text-sm text-rose-600">{errorMsg}</div>;

  const handleDownloadReceipt = async (payment) => {
    try {
      const res = await downloadReceipt(payment.id);
      downloadBlob(res.data, `receipt-${payment.month}-${payment.year}.pdf`);
    } catch (err) {
      toast.error('Could not download receipt');
    }
  };

  // Build a trend series only from paid amounts, ordered chronologically.
  const trendMonths = history.payments
    .filter((p) => p.status === 'paid')
    .map((p) => ({ month: p.month, collected: Number(p.amount) }));

  return (
    <div className="space-y-6 p-6 md:p-8">
      <div>
        <h1 className="font-serif text-2xl text-ink">Payment History</h1>
        <p className="mt-1 text-sm text-ink/50">Every month, on record.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Paid" value={formatCurrency(history.summary.totalPaid)} accent="green" />
        <StatCard label="Total Due" value={formatCurrency(history.summary.totalDue)} accent="red" />
        <StatCard label="Months Paid" value={history.summary.monthsPaid} />
        <StatCard label="Months Due" value={history.summary.monthsDue} accent="gold" />
      </div>

      {trendMonths.length > 0 && (
        <div className="rounded-lg border border-line bg-white p-5">
          <h2 className="font-serif text-lg text-ink">Payment Trend</h2>
          <div className="mt-2">
            <CollectionLineChart months={trendMonths} />
          </div>
        </div>
      )}

      <div className="rounded-lg border border-line bg-white">
        {history.payments.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-ink/40">No payment records yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink/40">
                  <th className="px-5 py-3 font-medium">Month</th>
                  <th className="px-5 py-3 font-medium">Amount</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Payment Date</th>
                  <th className="px-5 py-3 font-medium">Transaction ID</th>
                  <th className="px-5 py-3 font-medium text-right">Receipt</th>
                </tr>
              </thead>
              <tbody>
                {history.payments.map((p) => (
                  <tr key={p.id} className="border-b border-line last:border-0">
                    <td className="px-5 py-3 text-ink">
                      {MONTH_NAMES[p.month - 1]} {p.year}
                    </td>
                    <td className="px-5 py-3 text-ink/70">{formatCurrency(p.amount)}</td>
                    <td className="px-5 py-3">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-5 py-3 text-ink/50">{formatDate(p.payment_date)}</td>
                    <td className="px-5 py-3 text-ink/50">{p.transaction_id || '—'}</td>
                    <td className="px-5 py-3 text-right">
                      {p.status === 'paid' ? (
                        <button
                          onClick={() => handleDownloadReceipt(p)}
                          title="Download Receipt"
                          className="inline-flex items-center gap-1.5 rounded-md border border-line px-3 py-1.5 text-xs text-ink/60 transition hover:bg-ink/5"
                        >
                          <Download size={14} />
                          Receipt
                        </button>
                      ) : (
                        <span className="text-xs text-ink/25">—</span>
                      )}
                    </td>
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
