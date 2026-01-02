import "./SuccessModal.css";

export interface SuccessModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
}

export default function SuccessModal({
  open,
  onClose,
  title = "Success",
  message = "We have sent the update password link to your email, please check that!",
}: SuccessModalProps) {
  if (!open) return null;

  return (
    <div
      className="modal-mask"
      onMouseDown={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div className="modal-card" onMouseDown={(e) => e.stopPropagation()}>
        <button
          className="modal-x"
          onClick={onClose}
          aria-label="Close"
          type="button"
        >
          ✕
        </button>

        <div className="modal-body">
          <div className="modal-icon" aria-hidden="true">
            <svg width="72" height="72" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 6h16v12H4V6Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
              <path
                d="M4 7l8 6 8-6"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
              <path
                d="M14.5 14.5h5m0 0-2-2m2 2-2 2"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {title && <div className="modal-title">{title}</div>}
          <div className="modal-msg">{message}</div>
        </div>
      </div>
    </div>
  );
}
