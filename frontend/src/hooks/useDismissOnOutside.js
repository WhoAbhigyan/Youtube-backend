import { useEffect } from "react";

/** Closes a popover on outside click or Escape. */
const useDismissOnOutside = (ref, isOpen, onDismiss) => {
    useEffect(() => {
        if (!isOpen) return undefined;

        const handlePointerDown = (event) => {
            if (ref.current && !ref.current.contains(event.target)) {
                onDismiss();
            }
        };

        const handleKeyDown = (event) => {
            if (event.key === "Escape") onDismiss();
        };

        document.addEventListener("mousedown", handlePointerDown);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("mousedown", handlePointerDown);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [ref, isOpen, onDismiss]);
};

export default useDismissOnOutside;
