import Modal from "./Modal";
import "./ConfirmDialog.css";

/**
 * Destructive actions always ask first. `busy` keeps the dialog open while the
 * API call is running so the user sees the real outcome.
 */
const ConfirmDialog = ({
    open,
    title,
    message,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    tone = "danger",
    busy = false,
    onConfirm,
    onClose
}) => (
    <Modal open={open} onClose={busy ? () => {} : onClose} title={title} size="sm">
        <p className="confirm__message">{message}</p>

        <div className="confirm__actions">
            <button type="button" className="btn btn--ghost" onClick={onClose} disabled={busy}>
                {cancelLabel}
            </button>
            <button
                type="button"
                className={`btn btn--${tone}`}
                onClick={onConfirm}
                disabled={busy}
            >
                {busy && <span className="spinner spinner--sm" />}
                {confirmLabel}
            </button>
        </div>
    </Modal>
);

export default ConfirmDialog;
