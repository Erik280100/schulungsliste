import { useEffect, useRef } from "react";

export default function ConfirmDialog({ title, children, confirmLabel, onConfirm, onCancel }) {
  const ref = useRef(null);

  useEffect(() => {
    ref.current.showModal();
    ref.current.querySelector("button.cancel").focus();
  }, []);

  return (
    <dialog
      ref={ref}
      className="confirm"
      onCancel={(e) => {
        e.preventDefault();
        onCancel();
      }}
      onClick={(e) => e.target === ref.current && onCancel()}
    >
      <h3>{title}</h3>
      <p>{children}</p>
      <div className="actions">
        <button className="cancel" onClick={onCancel}>
          Abbrechen
        </button>
        <button className="danger" onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </dialog>
  );
}
