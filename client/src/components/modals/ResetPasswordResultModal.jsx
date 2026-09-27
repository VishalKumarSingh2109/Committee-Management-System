import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import Modal from '../common/Modal';

export default function ResetPasswordResultModal({ result, onClose }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(result.tempPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal title="Password Reset" onClose={onClose} width="max-w-sm">
      <p className="text-sm text-ink/70">
        A new password was generated for <span className="font-medium text-ink">{result.memberName}</span> (
        {result.email}). Share it with them directly — it won't be shown again.
      </p>

      <div className="mt-4 flex items-center justify-between rounded-md border border-line bg-ink/5 px-4 py-3">
        <code className="text-base font-medium tracking-wide text-ink">{result.tempPassword}</code>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-md bg-ink px-3 py-1.5 text-xs font-medium text-paper transition hover:bg-ink-light"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      <p className="mt-3 text-xs text-ink/40">
        They can change this to something memorable from Change Password once they log in.
      </p>

      <div className="mt-5 flex justify-end">
        <button onClick={onClose} className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-ink-light">
          Done
        </button>
      </div>
    </Modal>
  );
}
