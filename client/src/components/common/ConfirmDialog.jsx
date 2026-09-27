import Modal from './Modal';

export default function ConfirmDialog({ title, message, confirmLabel = 'Confirm', danger, onConfirm, onCancel }) {
  return (
    <Modal title={title} onClose={onCancel} width="max-w-sm">
      <p className="text-sm text-ink/70">{message}</p>
      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={onCancel}
          className="rounded-md border border-line px-4 py-2 text-sm text-ink/70 transition hover:bg-ink/5"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className={`rounded-md px-4 py-2 text-sm font-medium text-white transition ${
            danger ? 'bg-rose-600 hover:bg-rose-700' : 'bg-ink hover:bg-ink-light'
          }`}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
