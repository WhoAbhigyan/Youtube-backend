import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { CloseIcon } from "./Icons";
import "./Modal.css";

const Modal = ({ open, onClose, title, description, children, footer, labelledBy = "modal-title", size = "md" }) => {
    const panelRef = useRef(null);

    useEffect(() => {
        if (!open) return undefined;

        const handleKeyDown = (event) => {
            if (event.key === "Escape") onClose();
        };

        document.addEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "hidden";

        const focusTarget = panelRef.current?.querySelector(
            "input, textarea, select, button:not([data-autofocus-skip])"
        );
        focusTarget?.focus();

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "";
        };
    }, [open, onClose]);

    if (!open) return null;

    return createPortal(
        <div className="modal" role="presentation">
            <div className="modal__backdrop" onClick={onClose} />
            <div
                className={`modal__panel modal__panel--${size}`}
                role="dialog"
                aria-modal="true"
                aria-labelledby={labelledBy}
                ref={panelRef}
            >
                <header className="modal__header">
                    <div>
                        <h2 className="modal__title" id={labelledBy}>
                            {title}
                        </h2>
                        {description && <p className="modal__description">{description}</p>}
                    </div>
                    <button
                        type="button"
                        className="icon-btn icon-btn--sm"
                        onClick={onClose}
                        aria-label="Close dialog"
                        data-autofocus-skip
                    >
                        <CloseIcon size={20} />
                    </button>
                </header>

                <div className="modal__body">{children}</div>

                {footer && <footer className="modal__footer">{footer}</footer>}
            </div>
        </div>,
        document.body
    );
};

export default Modal;
