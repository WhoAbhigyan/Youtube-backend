import { useCallback, useEffect, useState } from "react";
import Avatar from "./Avatar";
import { NoComments, Notice } from "./States";
import { SkeletonRow } from "./Skeletons";
import { LikeIcon, TrashIcon } from "./Icons";
import { commentApi, likeApi } from "../services/endpoints";
import { getErrorMessage } from "../services/api";
import useAuth from "../hooks/useAuth";
import { cx, timeAgo } from "../utils/format";
import "./CommentSection.css";

const COMMENT_PAGE_SIZE = 10;

const Comment = ({ comment, currentUserId, onDelete }) => {
    const [liked, setLiked] = useState(false);
    const [pending, setPending] = useState(false);
    const [error, setError] = useState("");
    const isOwner = comment.owner?._id === currentUserId;

    const toggleLike = async () => {
        if (pending) return;

        setPending(true);
        setError("");
        try {
            const result = await likeApi.toggleComment(comment._id);
            setLiked(result.liked);
        } catch (err) {
            console.error("Comment like failed:", err);
            setError(getErrorMessage(err, "Could not update this like"));
        } finally {
            setPending(false);
        }
    };

    const remove = async () => {
        setPending(true);
        setError("");
        try {
            await commentApi.remove(comment._id);
            onDelete(comment._id);
        } catch (err) {
            console.error("Comment delete failed:", err);
            setError(getErrorMessage(err, "Could not delete this comment"));
            setPending(false);
        }
    };

    return (
        <article className="comment">
            <Avatar user={comment.owner} size={38} />

            <div className="comment__body">
                <div className="comment__head">
                    <span className="comment__author">
                        {comment.owner?.fullName || comment.owner?.username || "Unknown"}
                    </span>
                    <span className="comment__handle">@{comment.owner?.username ?? "unknown"}</span>
                    <span className="comment__time">{timeAgo(comment.createdAt)}</span>
                </div>

                <p className="comment__text">{comment.content}</p>

                <div className="comment__actions">
                    <button
                        type="button"
                        className={cx("comment__action", liked && "comment__action--active")}
                        onClick={toggleLike}
                        disabled={pending}
                        aria-pressed={liked}
                    >
                        {pending ? <span className="spinner spinner--sm" /> : <LikeIcon size={16} />}
                        <span className="sr-only">{liked ? "Remove like" : "Like comment"}</span>
                    </button>

                    {isOwner && (
                        <button
                            type="button"
                            className="comment__action comment__action--danger"
                            onClick={remove}
                            disabled={pending}
                        >
                            {pending ? <span className="spinner spinner--sm" /> : <TrashIcon size={16} />}
                            <span className="sr-only">Delete comment</span>
                        </button>
                    )}
                </div>

                {error && <p className="comment__error">{error}</p>}
            </div>
        </article>
    );
};

const CommentSection = ({ videoId }) => {
    const { user } = useAuth();
    const [comments, setComments] = useState([]);
    const [totalDocs, setTotalDocs] = useState(0);
    const [page, setPage] = useState(1);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [listError, setListError] = useState("");
    const [draft, setDraft] = useState("");
    const [posting, setPosting] = useState(false);
    const [postError, setPostError] = useState("");

    const load = useCallback(
        async (targetPage, append) => {
            const data = await commentApi.list(videoId, { page: targetPage, limit: COMMENT_PAGE_SIZE });
            setComments((current) => (append ? [...current, ...data.docs] : data.docs));
            setTotalDocs(data.totalDocs);
            setHasNextPage(data.hasNextPage);
            setPage(data.page);
        },
        [videoId]
    );

    useEffect(() => {
        let active = true;

        setLoading(true);
        setListError("");
        setComments([]);
        setDraft("");

        load(1, false)
            .catch((err) => {
                console.error("Failed to load comments:", err);
                if (active) setListError(getErrorMessage(err, "Could not load comments"));
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
        };
    }, [load]);

    const submit = async (event) => {
        event.preventDefault();
        if (posting || !draft.trim()) return;

        setPosting(true);
        setPostError("");

        try {
            const created = await commentApi.add(videoId, draft.trim());
            // the response is the stored comment; attach the current user for display
            setComments((current) => [{ ...created, owner: user }, ...current]);
            setTotalDocs((count) => count + 1);
            setDraft("");
        } catch (err) {
            console.error("Failed to post comment:", err);
            setPostError(getErrorMessage(err, "Could not post your comment"));
        } finally {
            setPosting(false);
        }
    };

    const loadMore = async () => {
        setLoadingMore(true);
        try {
            await load(page + 1, true);
        } catch (err) {
            console.error("Failed to load more comments:", err);
            setListError(getErrorMessage(err, "Could not load more comments"));
        } finally {
            setLoadingMore(false);
        }
    };

    const removeComment = (commentId) => {
        setComments((current) => current.filter((comment) => comment._id !== commentId));
        setTotalDocs((count) => Math.max(0, count - 1));
    };

    return (
        <section className="comments" aria-label="Comments">
            <header className="comments__head">
                <h2 className="comments__title">{totalDocs} Comments</h2>
            </header>

            <form className="comments__composer" onSubmit={submit}>
                <Avatar user={user} size={40} />
                <div className="comments__composer-body">
                    <input
                        className="comments__input"
                        type="text"
                        value={draft}
                        onChange={(event) => setDraft(event.target.value)}
                        placeholder="Add a comment…"
                        aria-label="Add a comment"
                        maxLength={1000}
                    />
                    {draft.trim() && (
                        <div className="comments__composer-actions">
                            <button
                                type="button"
                                className="btn btn--ghost btn--sm"
                                onClick={() => setDraft("")}
                                disabled={posting}
                            >
                                Cancel
                            </button>
                            <button type="submit" className="btn btn--primary btn--sm" disabled={posting}>
                                {posting && <span className="spinner spinner--sm" />}
                                {posting ? "Posting…" : "Comment"}
                            </button>
                        </div>
                    )}
                </div>
            </form>

            {postError && (
                <div className="comments__notice">
                    <Notice tone="error">{postError}</Notice>
                </div>
            )}

            <div className="comments__list">
                {loading ? (
                    <>
                        <SkeletonRow avatar lines={2} />
                        <SkeletonRow avatar lines={2} />
                        <SkeletonRow avatar lines={1} />
                    </>
                ) : listError && comments.length === 0 ? (
                    <Notice tone="error">{listError}</Notice>
                ) : comments.length === 0 ? (
                    <NoComments />
                ) : (
                    comments.map((comment) => (
                        <Comment
                            key={comment._id}
                            comment={comment}
                            currentUserId={user?._id}
                            onDelete={removeComment}
                        />
                    ))
                )}
            </div>

            {hasNextPage && (
                <div className="comments__more">
                    <button
                        type="button"
                        className="btn btn--outline btn--sm"
                        onClick={loadMore}
                        disabled={loadingMore}
                    >
                        {loadingMore && <span className="spinner spinner--sm" />}
                        {loadingMore ? "Loading…" : "Load more comments"}
                    </button>
                </div>
            )}
        </section>
    );
};

export default CommentSection;
