import { useState } from 'react';
import Modal from '../common/Modal';
import { formatCurrency, MONTH_NAMES } from '../../utils/formatters';

export default function VerifyPaymentModal({ payment, onClose, onConfirm }) {
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    setSubmitting(true);
    setError('');
    try {
      await onConfirm(paymentDate);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not verify this payment.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal title="Verify Payment" onClose={onClose} width="max-w-sm">
      <div className="space-y-3 text-sm">
        <div className="rounded-md bg-ink/5 p-3">
          <p className="text-ink">{payment.Member?.name}</p>
          <p className="mt-0.5 text-ink/50">
            {MONTH_NAMES[payment.month - 1]} {payment.year} · {formatCurrency(payment.amount)}
          </p>
          <p className="mt-0.5 text-ink/50">Reference: {payment.transaction_id || '—'}</p>
        </div>

        <p className="text-ink/60">
          Confirm you've checked this transaction reference against the club's UPI statement before marking it paid.
        </p>

        <div>
          <label className="block text-xs font-medium text-ink/70">Payment Date</label>
          <input
            type="date"
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
            className="mt-1 w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
          />
        </div>

        {error && <p className="text-xs text-rose-600">{error}</p>}
      </div>

      <div className="mt-5 flex justify-end gap-3">
        <button onClick={onClose} className="rounded-md border border-line px-4 py-2 text-sm text-ink/70 hover:bg-ink/5">
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          disabled={submitting}
          className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-60"
        >
          {submitting ? 'Verifying…' : 'Mark as Paid'}
        </button>
      </div>
    </Modal>
  );
}
