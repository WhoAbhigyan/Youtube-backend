import { useEffect, useState } from "react";
import SaveToPlaylist from "./SaveToPlaylist";
import { CheckIcon, BookmarkIcon, DislikeIcon, LikeIcon, ShareIcon } from "./Icons";
import { likeApi } from "../services/endpoints";
import { getErrorMessage } from "../services/api";
import useLikedVideos, { invalidateLikedVideos } from "../hooks/useLikedVideos";
import { cx } from "../utils/format";
import "./VideoActions.css";

const ActionButton = ({ icon: Icon, label, active, onClick, disabled, title, pending }) => (
    <button
        type="button"
        className={cx("vactions__btn", active && "vactions__btn--active")}
        onClick={onClick}
        disabled={disabled}
        aria-pressed={active}
        title={title ?? label}
    >
        {pending ? <span className="spinner spinner--sm" /> : <Icon size={20} />}
        <span className="vactions__label">{label}</span>
    </button>
);

const VideoActions = ({ video }) => {
    const { isLiked, loading } = useLikedVideos();
    const [liked, setLiked] = useState(false);
    const [pending, setPending] = useState(false);
    const [error, setError] = useState("");
    // keyed by action so a like confirmation is never shown under the share
    // button, and vice versa
    const [notices, setNotices] = useState({});
    const [saveOpen, setSaveOpen] = useState(false);

    const notify = (action, message) =>
        setNotices((current) => ({ ...current, [action]: message }));

    const clearNotice = (action) =>
        setNotices((current) => {
            if (!(action in current)) return current;
            const next = { ...current };
            delete next[action];
            return next;
        });

    // the liked state comes from the backend, not from local optimism
    useEffect(() => {
        if (!loading) setLiked(isLiked(video._id));
    }, [loading, isLiked, video._id]);

    const toggleLike = async () => {
        if (pending) return;

        setPending(true);
        setError("");
        clearNotice("like");

        try {
            const result = await likeApi.toggleVideo(video._id);
            setLiked(result.liked);
            notify("like", result.message);
            invalidateLikedVideos();
        } catch (err) {
            console.error("Like toggle failed:", err);
            setError(getErrorMessage(err, "Could not update your like"));
        } finally {
            setPending(false);
        }
    };

    const share = async () => {
        const url = window.location.href;

        if (navigator.share) {
            try {
                await navigator.share({ title: video.title, url });
                return;
            } catch (err) {
                // the user dismissed the native sheet, nothing to report
                if (err?.name === "AbortError") return;
            }
        }

        try {
            await navigator.clipboard.writeText(url);
            notify("share", "Link copied to clipboard");
        } catch {
            setError("Could not share this video");
        }
    };

    return (
        <div className="vactions">
            <div className="vactions__group">
                <ActionButton
                    icon={LikeIcon}
                    label="Like"
                    active={liked}
                    pending={pending}
                    onClick={toggleLike}
                    title={liked ? "Remove like" : "Like this video"}
                />
                <span className="vactions__divider" aria-hidden="true" />
                <ActionButton
                    icon={DislikeIcon}
                    label="Dislike"
                    disabled
                    title="Dislikes are not supported by the backend yet"
                />
            </div>

            <div className="vactions__group">
                <ActionButton icon={ShareIcon} label="Share" onClick={share} />
                <ActionButton
                    icon={BookmarkIcon}
                    label="Save"
                    onClick={() => setSaveOpen(true)}
                    title="Save to a playlist"
                />
            </div>

            {error && (
                <p className="vactions__feedback vactions__feedback--error" role="status">
                    {error}
                </p>
            )}

            {notices.like && (
                <p className="vactions__feedback" role="status">
                    <CheckIcon size={15} />
                    {notices.like}
                </p>
            )}

            {notices.share && (
                <p className="vactions__feedback" role="status">
                    <CheckIcon size={15} />
                    {notices.share}
                </p>
            )}

            {notices.save && (
                <p className="vactions__feedback" role="status">
                    <CheckIcon size={15} />
                    {notices.save}
                </p>
            )}

            <SaveToPlaylist
                videoId={video._id}
                open={saveOpen}
                onClose={() => setSaveOpen(false)}
                onSaved={(playlist) => notify("save", `Saved to “${playlist.name}”`)}
            />
        </div>
    );
};

export default VideoActions;
