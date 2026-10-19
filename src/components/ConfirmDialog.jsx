import { useEffect, useRef } from "react";
import { LogoutIcon } from "./Icons";
import "./ConfirmDialog.css";

function ConfirmDialog({ open, title, message, confirmLabel, onConfirm, onCancel }) {
  const cancelRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    function handleKey(event) {
      if (event.key === "Escape") onCancel();
    }

    document.addEventListener("keydown", handleKey);
    cancelRef.current?.focus();

    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="confirm-backdrop" onClick={onCancel}>
      <div
        className="confirm-box"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        onClick={(event) => event.stopPropagation()}
      >
        <span className="confirm-icon">
          <LogoutIcon size={26} />
        </span>
        <h2 id="confirm-title">{title}</h2>
        <p>{message}</p>

        <div className="confirm-actions">
          <button ref={cancelRef} className="btn btn-outline" onClick={onCancel}>
            Cancel
          </button>
          <button className="confirm-danger" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;