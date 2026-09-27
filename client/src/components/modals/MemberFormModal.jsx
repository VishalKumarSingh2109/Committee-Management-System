import { useState } from 'react';
import Modal from '../common/Modal';

const EMPTY = {
  name: '',
  email: '',
  phone: '',
  address: '',
  join_date: '',
  monthly_fee: '',
  status: 'active',
};

/**
 * mode: 'add' | 'edit'
 * initial: member object when editing
 */
export default function MemberFormModal({ mode, initial, onClose, onSubmit }) {
  const [form, setForm] = useState(
    mode === 'edit' && initial
      ? {
          name: initial.name || '',
          email: initial.email || '',
          phone: initial.phone || '',
          address: initial.address || '',
          join_date: initial.join_date || '',
          monthly_fee: initial.monthly_fee || '',
          status: initial.status || 'active',
        }
      : EMPTY
  );
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Full name is required';
    if (mode === 'add' && !/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'A valid email is required';
    if (!/^\d{7,15}$/.test(form.phone.trim())) e.phone = 'Enter a valid phone number (7-15 digits, no spaces or symbols)';
    if (!form.join_date) e.join_date = 'Join date is required';
    if (form.monthly_fee === '' || Number(form.monthly_fee) < 0) e.monthly_fee = 'Enter a valid fee amount';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setApiError('');
    if (!validate()) return;

    setSubmitting(true);
    try {
      await onSubmit(form);
    } catch (err) {
      setApiError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (field) =>
    `mt-1.5 w-full rounded-md border px-3.5 py-2 text-sm text-ink outline-none transition focus:ring-2 focus:ring-gold/20 ${
      errors[field] ? 'border-rose-300 focus:border-rose-400' : 'border-line focus:border-gold'
    }`;

  return (
    <Modal title={mode === 'add' ? 'Add Member' : 'Edit Member'} onClose={onClose} width="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-ink/80">Full Name</label>
          <input value={form.name} onChange={set('name')} className={inputClass('name')} />
          {errors.name && <p className="mt-1 text-xs text-rose-600">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-ink/80">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={set('email')}
            disabled={mode === 'edit'}
            className={`${inputClass('email')} ${mode === 'edit' ? 'bg-ink/5 text-ink/50' : ''}`}
          />
          {mode === 'edit' && <p className="mt-1 text-xs text-ink/40">Login email can't be changed here.</p>}
          {errors.email && <p className="mt-1 text-xs text-rose-600">{errors.email}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-ink/80">Phone Number</label>
            <input value={form.phone} onChange={set('phone')} className={inputClass('phone')} />
            {errors.phone && <p className="mt-1 text-xs text-rose-600">{errors.phone}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-ink/80">Join Date</label>
            <input type="date" value={form.join_date} onChange={set('join_date')} className={inputClass('join_date')} />
            {errors.join_date && <p className="mt-1 text-xs text-rose-600">{errors.join_date}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-ink/80">Address</label>
          <textarea value={form.address} onChange={set('address')} rows={2} className={inputClass('address')} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-ink/80">Monthly Fee (₹)</label>
            <input
              type="number"
              min="0"
              value={form.monthly_fee}
              onChange={set('monthly_fee')}
              className={inputClass('monthly_fee')}
            />
            {errors.monthly_fee && <p className="mt-1 text-xs text-rose-600">{errors.monthly_fee}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-ink/80">Status</label>
            <select value={form.status} onChange={set('status')} className={inputClass('status')}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {apiError && (
          <div className="rounded-md border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700">
            {apiError}
          </div>
        )}

        {mode === 'add' && (
          <p className="text-xs text-ink/40">
            A login account will be created with the default password <code className="rounded bg-ink/5 px-1">Member@123</code> — share it with the member.
          </p>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="rounded-md border border-line px-4 py-2 text-sm text-ink/70 hover:bg-ink/5">
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-paper transition hover:bg-ink-light disabled:opacity-60"
          >
            {submitting ? 'Saving…' : mode === 'add' ? 'Add Member' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
