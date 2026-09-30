import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import Avatar from "../components/Avatar";
import ConfirmDialog from "../components/ConfirmDialog";
import { EmptyState, ErrorState, Notice } from "../components/States";
import { SkeletonRow } from "../components/Skeletons";
import { BoltIcon, CloseIcon, TrashIcon } from "../components/Icons";
import useAuth from "../hooks/useAuth";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { tweetApi } from "../services/endpoints";
import { getErrorMessage } from "../services/api";
import { pluralize, timeAgo } from "../utils/format";
import "./Community.css";

const MAX_LENGTH = 300;

const Community = () => {
    useDocumentTitle("Community");

    const { user } = useAuth();
    const [tweets, setTweets] = useState([]);
    const [draft, setDraft] = useState("");
    const [loading, setLoading] = useState(true);
    const [posting, setPosting] = useState(false);
    const [postError, setPostError] = useState("");
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [deleting, setDeleting] = useState(null);
    const [deleteBusy, setDeleteBusy] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const data = await tweetApi.list();
            setTweets(data);
        } catch (err) {
            console.error("Failed to load community posts:", err);
            setError(getErrorMessage(err, "Could not load your posts"));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const submit = async (event) => {
        event.preventDefault();
        if (posting || !draft.trim()) return;

        setPosting(true);
        setPostError("");
        setNotice("");

        try {
            const tweet = await tweetApi.create(draft.trim());
            setTweets((current) => [{ ...tweet, owner: user }, ...current]);
            setDraft("");
        } catch (err) {
            console.error("Failed to post:", err);
            setPostError(getErrorMessage(err, "Could not post this update"));
        } finally {
            setPosting(false);
        }
    };

    const confirmDelete = async () => {
        if (!deleting || deleteBusy) return;

        setDeleteBusy(true);
        try {
            await tweetApi.remove(deleting._id);
            setTweets((current) => current.filter((tweet) => tweet._id !== deleting._id));
            setDeleting(null);
            setNotice("Post deleted.");
        } catch (err) {
            console.error("Failed to delete post:", err);
            setNotice(getErrorMessage(err, "Could not delete this post"));
        } finally {
            setDeleteBusy(false);
        }
    };

    return (
        <div className="community">
            <PageHeader
                eyebrow="Community"
                title="Your posts"
                description="Short updates stored on your profile — the same collection the backend exposes as tweets."
            />

            <form className="composer panel" onSubmit={submit}>
                <Avatar user={user} size={42} />

                <div className="composer__body">
                    <label className="sr-only" htmlFor="community-draft">
                        Write an update
                    </label>
                    <textarea
                        id="community-draft"
                        className="textarea composer__input"
                        value={draft}
                        onChange={(event) => setDraft(event.target.value)}
                        placeholder="Share an update with your audience…"
                        maxLength={MAX_LENGTH}
                    />

                    <div className="composer__foot">
                        <span className={draft.length > MAX_LENGTH ? "composer__count composer__count--max" : "composer__count"}>
                            {draft.length}/{MAX_LENGTH}
                        </span>

                        <button
                            type="submit"
                            className="btn btn--primary btn--sm"
                            disabled={posting || !draft.trim()}
                        >
                            {posting && <span className="spinner spinner--sm" />}
                            {posting ? "Posting…" : "Post"}
                        </button>
                    </div>
                </div>
            </form>

            {postError && (
                <div className="community__notice">
                    <Notice tone="error">{postError}</Notice>
                </div>
            )}

            {notice && (
                <div className="community__notice">
                    <Notice tone="info">{notice}</Notice>
                </div>
            )}

            {loading ? (
                <div className="community__list">
                    <SkeletonRow lines={2} avatar />
                    <SkeletonRow lines={2} avatar />
                </div>
            ) : error && tweets.length === 0 ? (
                <ErrorState title="Could not load your posts" message={error} onRetry={load} />
            ) : tweets.length === 0 ? (
                <EmptyState
                    icon={BoltIcon}
                    title="No posts yet"
                    description={`Share your first update — the limit is ${MAX_LENGTH} characters.`}
                />
            ) : (
                <div className="community__list">
                    <p className="community__count">{pluralize(tweets.length, "post")}</p>

                    {tweets.map((tweet) => (
                        <article key={tweet._id} className="post">
                            <Avatar user={tweet.owner ?? user} size={40} />

                            <div className="post__body">
                                <div className="post__head">
                                    <span className="post__author">{user?.fullName || user?.username}</span>
                                    <span className="post__handle">@{user?.username}</span>
                                    <span className="post__time">{timeAgo(tweet.createdAt)}</span>
                                </div>

                                <p className="post__content">{tweet.content}</p>
                            </div>

                            <button
                                type="button"
                                className="icon-btn icon-btn--sm post__delete"
                                onClick={() => setDeleting(tweet)}
                                title="Delete post"
                                aria-label="Delete post"
                            >
                                <TrashIcon size={18} />
                            </button>
                        </article>
                    ))}
                </div>
            )}

            <p className="community__hint">
                <CloseIcon size={14} />
                Posts are visible to you only — the backend exposes no public community feed.
                <Link to="/subscriptions"> Browse subscriptions instead.</Link>
            </p>

            <ConfirmDialog
                open={Boolean(deleting)}
                title="Delete this post?"
                message="This update will be removed permanently."
                confirmLabel="Delete post"
                busy={deleteBusy}
                onConfirm={confirmDelete}
                onClose={() => setDeleting(null)}
            />
        </div>
    );
};

export default Community;
