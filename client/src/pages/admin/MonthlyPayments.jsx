import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { CheckCircle2, Download } from 'lucide-react';
import * as paymentService from '../../services/paymentService';
import { downloadBlob } from '../../utils/download';
import StatusBadge from '../../components/common/StatusBadge';
import StatCard from '../../components/common/StatCard';
import Loader from '../../components/common/Loader';
import VerifyPaymentModal from '../../components/modals/VerifyPaymentModal';
import { formatCurrency, formatDate, MONTH_NAMES } from '../../utils/formatters';

const now = new Date();
const currentYear = now.getFullYear();
const YEAR_OPTIONS = [currentYear - 1, currentYear, currentYear + 1];

export default function MonthlyPayments() {
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(currentYear);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verifyTarget, setVerifyTarget] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await paymentService.getMonthlyPayments(month, year);
      setData(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not load the monthly table');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, year]);

  const handleVerify = async (paymentDate) => {
    await paymentService.verifyPayment(verifyTarget.id, { payment_date: paymentDate });
    toast.success(`Payment marked as paid for ${verifyTarget.Member?.name}`);
    setVerifyTarget(null);
    load();
  };

  const handleDownloadReceipt = async (payment) => {
    try {
      const res = await paymentService.downloadReceipt(payment.id);
      downloadBlob(res.data, `receipt-${payment.Member?.name}-${payment.month}-${payment.year}.pdf`);
    } catch (err) {
      toast.error('Could not download receipt');
    }
  };

  return (
    <div className="space-y-6 p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl text-ink">Monthly Payment Table</h1>
          <p className="mt-1 text-sm text-ink/50">Select a month to view or record dues</p>
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

      {loading || !data ? (
        <Loader label="Loading table…" />
      ) : (
        <>
          {/* Summary */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            <StatCard label="Total Members" value={data.summary.totalMembers} />
            <StatCard label="Collected" value={formatCurrency(data.summary.totalCollected)} accent="green" />
            <StatCard label="Due" value={formatCurrency(data.summary.totalDue)} accent="red" />
            <StatCard label="Paid" value={data.summary.paidCount} accent="ink" />
            <StatCard label="Due Count" value={data.summary.dueCount} accent="gold" />
          </div>

          {/* Table */}
          <div className="rounded-lg border border-line bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink/40">
                    <th className="px-5 py-3 font-medium">Member</th>
                    <th className="px-5 py-3 font-medium">Monthly Fee</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Payment Date</th>
                    <th className="px-5 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.payments.map((p) => (
                    <tr key={p.id} className="border-b border-line last:border-0">
                      <td className="px-5 py-3 text-ink">{p.Member?.name}</td>
                      <td className="px-5 py-3 text-ink/70">{formatCurrency(p.amount)}</td>
                      <td className="px-5 py-3">
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="px-5 py-3 text-ink/50">{formatDate(p.payment_date)}</td>
                      <td className="px-5 py-3 text-right">
                        {p.status === 'pending' ? (
                          <button
                            onClick={() => setVerifyTarget(p)}
                            className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 transition hover:bg-emerald-100"
                          >
                            <CheckCircle2 size={14} />
                            Verify
                          </button>
                        ) : p.status === 'paid' ? (
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
          </div>
        </>
      )}

      {verifyTarget && (
        <VerifyPaymentModal payment={verifyTarget} onClose={() => setVerifyTarget(null)} onConfirm={handleVerify} />
      )}
    </div>
  );
}
