import { useState } from "react";
import { subscriptionApi } from "../services/endpoints";
import { getErrorMessage } from "../services/api";
import { cx } from "../utils/format";
import { CheckIcon, PlusIcon } from "./Icons";
import "./SubscribeButton.css";

/**
 * Reflects the backend subscription state; it only changes after the API call
 * succeeds and reverts if the call fails.
 */
const SubscribeButton = ({ channelId, initialSubscribed, onChange, className }) => {
    const [subscribed, setSubscribed] = useState(Boolean(initialSubscribed));
    const [pending, setPending] = useState(false);
    const [error, setError] = useState("");

    const toggle = async () => {
        if (pending) return;

        setPending(true);
        setError("");

        const previous = subscribed;
        setSubscribed(!previous); // optimistic, reverted below on failure

        try {
            const result = await subscriptionApi.toggle(channelId);
            setSubscribed(result.subscribed);
            onChange?.(result.subscribed);
        } catch (err) {
            console.error("Subscription update failed:", err);
            setSubscribed(previous);
            setError(getErrorMessage(err, previous ? "Could not unsubscribe" : "Could not subscribe"));
        } finally {
            setPending(false);
        }
    };

    return (
        <div className={cx("subscribe", className)}>
            <button
                type="button"
                className={cx("btn", subscribed ? "subscribe__btn subscribe__btn--on" : "subscribe__btn")}
                onClick={toggle}
                disabled={pending}
                aria-pressed={subscribed}
                title={error || undefined}
            >
                {pending ? (
                    <span className="spinner spinner--sm" />
                ) : subscribed ? (
                    <CheckIcon size={18} />
                ) : (
                    <PlusIcon size={18} />
                )}
                <span>{subscribed ? "Subscribed" : "Subscribe"}</span>
            </button>

            {error && <p className="subscribe__error">{error}</p>}
        </div>
    );
};

export default SubscribeButton;
