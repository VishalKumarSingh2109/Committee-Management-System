import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Search, Plus, Eye, Pencil, UserX, UserCheck, KeyRound } from 'lucide-react';
import * as memberService from '../../services/memberService';
import StatusBadge from '../../components/common/StatusBadge';
import Loader from '../../components/common/Loader';
import MemberFormModal from '../../components/modals/MemberFormModal';
import MemberDetailModal from '../../components/modals/MemberDetailModal';
import ResetPasswordResultModal from '../../components/modals/ResetPasswordResultModal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { formatCurrency, formatDate } from '../../utils/formatters';

export default function Members() {
  const [members, setMembers] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [formModal, setFormModal] = useState(null); // { mode, initial }
  const [detailMember, setDetailMember] = useState(null);
  const [confirmTarget, setConfirmTarget] = useState(null); // member being deactivated
  const [resetTarget, setResetTarget] = useState(null); // member whose password is being reset
  const [resetResult, setResetResult] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await memberService.getMembers({ search: search || undefined, status: status || undefined, page, limit: 10 });
      setMembers(res.data.data.members);
      setPagination(res.data.data.pagination);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not load members');
    } finally {
      setLoading(false);
    }
  }, [search, status, page]);

  useEffect(() => {
    load();
  }, [load]);

  // Reset to page 1 whenever the filters change
  useEffect(() => {
    setPage(1);
  }, [search, status]);

  const handleAdd = async (form) => {
    await memberService.createMember(form);
    toast.success('Member added successfully');
    setFormModal(null);
    load();
  };

  const handleEdit = async (form) => {
    await memberService.updateMember(formModal.initial.id, form);
    toast.success('Member updated successfully');
    setFormModal(null);
    load();
  };

  const handleToggleStatus = async () => {
    const member = confirmTarget;
    try {
      if (member.status === 'active') {
        await memberService.deleteMember(member.id); // soft delete -> inactive
        toast.success(`${member.name} deactivated`);
      } else {
        await memberService.updateMember(member.id, { status: 'active' });
        toast.success(`${member.name} reactivated`);
      }
      setConfirmTarget(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update status');
    }
  };

  const handleResetPassword = async () => {
    try {
      const res = await memberService.resetMemberPassword(resetTarget.id);
      setResetResult(res.data.data);
      setResetTarget(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not reset password');
      setResetTarget(null);
    }
  };

  return (
    <div className="space-y-6 p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl text-ink">Members</h1>
          <p className="mt-1 text-sm text-ink/50">{pagination.total} total</p>
        </div>
        <button
          onClick={() => setFormModal({ mode: 'add' })}
          className="flex items-center gap-2 rounded-md bg-ink px-4 py-2 text-sm font-medium text-paper transition hover:bg-ink-light"
        >
          <Plus size={16} />
          Add Member
        </button>
      </div>

      {/* Search + filter */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or phone"
            className="w-full rounded-md border border-line bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-md border border-line bg-white px-3 py-2 text-sm outline-none focus:border-gold"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-line bg-white">
        {loading ? (
          <Loader label="Loading members…" />
        ) : members.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-ink/40">
            {search || status ? 'No members match your search.' : 'No members yet — add your first one.'}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink/40">
                  <th className="px-5 py-3 font-medium">Member</th>
                  <th className="px-5 py-3 font-medium">Phone</th>
                  <th className="px-5 py-3 font-medium">Join Date</th>
                  <th className="px-5 py-3 font-medium">Monthly Fee</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m.id} className="border-b border-line last:border-0">
                    <td className="px-5 py-3">
                      <p className="text-ink">{m.name}</p>
                      <p className="text-xs text-ink/40">{m.email}</p>
                    </td>
                    <td className="px-5 py-3 text-ink/70">{m.phone}</td>
                    <td className="px-5 py-3 text-ink/70">{formatDate(m.join_date)}</td>
                    <td className="px-5 py-3 text-ink/70">{formatCurrency(m.monthly_fee)}</td>
                    <td className="px-5 py-3">
                      <StatusBadge status={m.status} />
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          title="View"
                          onClick={() => setDetailMember(m)}
                          className="rounded-md p-1.5 text-ink/50 transition hover:bg-ink/5 hover:text-ink"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          title="Edit"
                          onClick={() => setFormModal({ mode: 'edit', initial: m })}
                          className="rounded-md p-1.5 text-ink/50 transition hover:bg-ink/5 hover:text-ink"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          title={m.status === 'active' ? 'Deactivate' : 'Reactivate'}
                          onClick={() => setConfirmTarget(m)}
                          className="rounded-md p-1.5 text-ink/50 transition hover:bg-ink/5 hover:text-ink"
                        >
                          {m.status === 'active' ? <UserX size={16} /> : <UserCheck size={16} />}
                        </button>
                        <button
                          title="Reset Password"
                          onClick={() => setResetTarget(m)}
                          className="rounded-md p-1.5 text-ink/50 transition hover:bg-ink/5 hover:text-ink"
                        >
                          <KeyRound size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
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

      {/* Modals */}
      {formModal && (
        <MemberFormModal
          mode={formModal.mode}
          initial={formModal.initial}
          onClose={() => setFormModal(null)}
          onSubmit={formModal.mode === 'add' ? handleAdd : handleEdit}
        />
      )}

      {detailMember && <MemberDetailModal member={detailMember} onClose={() => setDetailMember(null)} />}

      {confirmTarget && (
        <ConfirmDialog
          title={confirmTarget.status === 'active' ? 'Deactivate member?' : 'Reactivate member?'}
          message={
            confirmTarget.status === 'active'
              ? `${confirmTarget.name} will be marked inactive. Their payment history is kept, and they can be reactivated anytime.`
              : `${confirmTarget.name} will be marked active again.`
          }
          confirmLabel={confirmTarget.status === 'active' ? 'Deactivate' : 'Reactivate'}
          danger={confirmTarget.status === 'active'}
          onConfirm={handleToggleStatus}
          onCancel={() => setConfirmTarget(null)}
        />
      )}

      {resetTarget && (
        <ConfirmDialog
          title="Reset password?"
          message={`A new random password will be generated for ${resetTarget.name}, replacing their current one immediately. You'll need to share the new password with them.`}
          confirmLabel="Reset Password"
          danger
          onConfirm={handleResetPassword}
          onCancel={() => setResetTarget(null)}
        />
      )}

      {resetResult && <ResetPasswordResultModal result={resetResult} onClose={() => setResetResult(null)} />}
    </div>
  );
}
