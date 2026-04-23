'use client';

import Modal from './Modal';

export default function ConfirmDialog({
  open, onClose, onConfirm, title, message, confirmLabel = 'Confirm',
  tone = 'danger', loading,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  tone?: 'danger' | 'primary';
  loading?: boolean;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <button onClick={onClose} className="btn-secondary h-9">Cancel</button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={
              tone === 'danger'
                ? 'inline-flex items-center justify-center h-9 px-4 rounded-md bg-rose-600 text-white text-[13px] font-medium hover:bg-rose-700 transition-colors disabled:opacity-50'
                : 'btn-primary h-9'
            }
          >
            {loading ? 'Working…' : confirmLabel}
          </button>
        </>
      }
    >
      <p className="text-[13.5px] text-slate-600 leading-relaxed">{message}</p>
    </Modal>
  );
}
