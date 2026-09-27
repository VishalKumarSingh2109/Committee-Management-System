import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { CheckCircle2, Download, FileDown } from 'lucide-react';
import * as paymentService from '../../services/paymentService';
import { downloadBlob } from '../../utils/download';
import StatusBadge from '../../components/common/StatusBadge';
import Loader from '../../components/common/Loader';
import VerifyPaymentModal from '../../components/modals/VerifyPaymentModal';
import { formatCurrency, formatDate, MONTH_NAMES } from '../../utils/formatters';

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = [currentYear - 1, currentYear, currentYear + 1];

export default function PaymentManagement() {
  const [payments, setPayments] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [status, setStatus] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [verifyTarget, setVerifyTarget] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await paymentService.getPayments({
        status: status || undefined,
        month: month || undefined,
        year: year || undefined,
        page,
        limit: 10,
      });
      setPayments(res.data.data.payments);
      setPagination(res.data.data.pagination);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not load payments');
    } finally {
      setLoading(false);
    }
  }, [status, month, year, page]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [status, month, year]);

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

  const handleExportCsv = async () => {
    try {
      const res = await paymentService.exportPaymentsCsv({
        status: status || undefined,
        month: month || undefined,
        year: year || undefined,
      });
      downloadBlob(res.data, 'payments-export.csv');
    } catch (err) {
      toast.error('Could not export payments');
    }
  };

  return (
    <div className="space-y-6 p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl text-ink">Payments</h1>
          <p className="mt-1 text-sm text-ink/50">{pagination.total} records</p>
        </div>
        <button
          onClick={handleExportCsv}
          className="flex items-center gap-2 rounded-md border border-line px-4 py-2 text-sm font-medium text-ink/70 transition hover:bg-ink/5"
        >
          <FileDown size={16} />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-md border border-line bg-white px-3 py-2 text-sm outline-none focus:border-gold"
        >
          <option value="">All statuses</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="due">Due</option>
        </select>

        <select
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="rounded-md border border-line bg-white px-3 py-2 text-sm outline-none focus:border-gold"
        >
          <option value="">All months</option>
          {MONTH_NAMES.map((name, i) => (
            <option key={name} value={i + 1}>
              {name}
            </option>
          ))}
        </select>

        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="rounded-md border border-line bg-white px-3 py-2 text-sm outline-none focus:border-gold"
        >
          <option value="">All years</option>
          {YEAR_OPTIONS.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-line bg-white">
        {loading ? (
          <Loader label="Loading payments…" />
        ) : payments.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-ink/40">No payment records match these filters.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink/40">
                  <th className="px-5 py-3 font-medium">Member</th>
                  <th className="px-5 py-3 font-medium">Month</th>
                  <th className="px-5 py-3 font-medium">Amount</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Payment Date</th>
                  <th className="px-5 py-3 font-medium">Reference ID</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
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
                    <td className="px-5 py-3 text-ink/50">{p.transaction_id || '—'}</td>
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
        )}
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-ink/60">
          <span>
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-md border border-line px-3 py-1.5 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-md border border-line px-3 py-1.5 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {verifyTarget && (
        <VerifyPaymentModal payment={verifyTarget} onClose={() => setVerifyTarget(null)} onConfirm={handleVerify} />
      )}
    </div>
  );
}
