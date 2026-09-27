import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';
import { getClubInfo } from '../../services/clubService';
import { getOwnMember } from '../../services/memberService';
import * as paymentService from '../../services/paymentService';
import Loader from '../../components/common/Loader';
import { formatCurrency, MONTH_NAMES } from '../../utils/formatters';

const now = new Date();
const YEAR_OPTIONS = [now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1];

export default function PaymentPage() {
  const [club, setClub] = useState(null);
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);

  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [transactionId, setTransactionId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    Promise.all([getClubInfo(), getOwnMember()])
      .then(([clubRes, memberRes]) => {
        setClub(clubRes.data.data);
        setMember(memberRes.data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader label="Loading payment details…" />;
  if (!member) return null;

  const amount = member.monthly_fee;
  const upiUri = `upi://pay?pa=${encodeURIComponent(club.upiId)}&pn=${encodeURIComponent(
    club.name
  )}&am=${amount}&cu=INR&tn=${encodeURIComponent(`${member.name} - ${MONTH_NAMES[month - 1]} ${year}`)}`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!transactionId.trim()) {
      setError('Enter the transaction or reference ID from your UPI app.');
      return;
    }
    setSubmitting(true);
    try {
      await paymentService.submitPayment({ month, year, transaction_id: transactionId.trim() });
      setSubmitted(true);
      toast.success('Payment submitted — the admin will verify it shortly.');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not submit your payment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl space-y-6 p-6 md:p-8">
      <div>
        <h1 className="font-serif text-2xl text-ink">Make a Payment</h1>
        <p className="mt-1 text-sm text-ink/50">Scan, pay, then confirm the reference ID below.</p>
      </div>

      <div className="rounded-lg border border-line bg-white p-6 text-center">
        <p className="text-sm text-ink/50">{club.name}</p>
        <p className="mt-1 font-serif text-3xl text-ink">{formatCurrency(amount)}</p>
        <p className="mt-1 text-xs text-ink/40">UPI ID: {club.upiId}</p>

        <div className="mx-auto mt-5 flex w-fit items-center justify-center rounded-lg border border-line bg-white p-4">
          <QRCodeSVG value={upiUri} size={200} />
        </div>

        <p className="mx-auto mt-4 max-w-sm text-xs leading-relaxed text-ink/50">
          Open any UPI app (GPay, PhonePe, Paytm) and scan this code, or use the UPI ID above directly. After paying,
          enter the transaction reference below — your admin will verify it before it's marked paid.
        </p>
      </div>

      {submitted ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-center">
          <p className="text-sm font-medium text-amber-800">Submitted for verification</p>
          <p className="mt-1 text-xs text-amber-700">
            Your payment for {MONTH_NAMES[month - 1]} {year} is now pending. Check your dashboard once the admin
            confirms it.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-line bg-white p-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink/80">Month</label>
              <select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="mt-1.5 w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
              >
                {MONTH_NAMES.map((name, i) => (
                  <option key={name} value={i + 1}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink/80">Year</label>
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="mt-1.5 w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
              >
                {YEAR_OPTIONS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink/80">Transaction / Reference ID</label>
            <input
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              maxLength={100}
              placeholder="e.g. TXN10023456"
              className="mt-1.5 w-full rounded-md border border-line px-3.5 py-2.5 text-sm outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
            />
          </div>

          {error && <p className="text-sm text-rose-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-md bg-ink py-2.5 text-sm font-medium text-paper transition hover:bg-ink-light disabled:opacity-60"
          >
            {submitting ? 'Submitting…' : 'Submit Payment'}
          </button>
        </form>
      )}
    </div>
  );
}
