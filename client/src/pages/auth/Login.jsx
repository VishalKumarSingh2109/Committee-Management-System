import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const user = await login(email, password);
      navigate(user.role === 'admin' ? '/admin' : '/member');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not sign in. Check your details and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left panel — brand */}
      <div className="relative hidden w-2/5 flex-col justify-between overflow-hidden bg-ink p-12 text-paper lg:flex">
        {/* subtle ledger-line texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(to bottom, transparent, transparent 38px, #e4c77e 39px)',
          }}
        />
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-gold-light/40 text-gold-light">
              <span className="font-serif text-lg">C</span>
            </div>
            <span className="text-sm tracking-wide text-paper/70">Committee Management</span>
          </div>
        </div>

        <div className="relative max-w-sm">
          <h1 className="font-serif text-4xl font-medium leading-tight text-paper">
            Every payment, accounted for.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-paper/70">
            One place for your society to track members, dues, and who's paid
            this month — no spreadsheets, no chasing.
          </p>
        </div>

        <div className="relative text-sm text-paper/50">
          Trusted record-keeping for resident and member committees.
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex w-full items-center justify-center bg-paper px-6 py-12 lg:w-3/5">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-gold text-gold">
                <span className="font-serif text-base">C</span>
              </div>
              <span className="text-sm text-ink/60">Committee Management</span>
            </div>
          </div>

          <h2 className="font-serif text-2xl font-medium text-ink">Sign in</h2>
          <p className="mt-1 text-sm text-ink/60">
            Enter your details to reach your dashboard.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-ink/80">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 w-full rounded-md border border-line bg-white px-3.5 py-2.5 text-ink outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-ink/80">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 w-full rounded-md border border-line bg-white px-3.5 py-2.5 text-ink outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-md bg-ink py-2.5 text-sm font-medium text-paper transition hover:bg-ink-light disabled:opacity-60"
            >
              {submitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
