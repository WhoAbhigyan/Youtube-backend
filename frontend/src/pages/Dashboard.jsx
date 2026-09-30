import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import ConfirmDialog from "../components/ConfirmDialog";
import FileInput from "../components/FileInput";
import Modal from "../components/Modal";
import { EmptyState, ErrorState, Notice } from "../components/States";
import { SkeletonRow, SkeletonStats } from "../components/Skeletons";
import {
    BoltIcon,
    CheckIcon,
    DashboardIcon,
    EditIcon,
    EyeIcon,
    LikeVideosIcon,
    TrashIcon,
    UploadIcon,
    FilmIcon
} from "../components/Icons";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { dashboardApi, videoApi } from "../services/endpoints";
import { getErrorMessage } from "../services/api";
import { cx, formatDate, formatViews, pluralize } from "../utils/format";
import "./Dashboard.css";

const DASHBOARD_PAGE_SIZE = 10;

const StatCard = ({ icon: Icon, label, value, loading }) => (
    <div className="stat">
        <span className="stat__icon">
            <Icon size={20} />
        </span>
        <div className="stat__body">
            <p className="stat__value">{loading ? "—" : value}</p>
            <p className="stat__label">{label}</p>
        </div>
    </div>
);

const EditVideoModal = ({ open, video, onClose, onSaved }) => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [thumbnail, setThumbnail] = useState(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!video) return;
        setTitle(video.title ?? "");
        setDescription(video.description ?? "");
        setThumbnail(null);
        setError("");
    }, [video]);

    const submit = async (event) => {
        event.preventDefault();
        if (saving || !video) return;

        const payload = new FormData();
        payload.append("title", title.trim());
        payload.append("description", description.trim());
        if (thumbnail) payload.append("thumbnail", thumbnail);

        setSaving(true);
        setError("");

        try {
            const updated = await videoApi.update(video._id, payload);
            onSaved(updated);
            onClose();
        } catch (err) {
            console.error("Video update failed:", err);
            setError(getErrorMessage(err, "Could not save your changes"));
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal open={open} onClose={onClose} title="Edit video" description="The video file itself cannot be replaced.">
            <form className="edit-video" onSubmit={submit} id="edit-video-form">
                {error && <Notice tone="error">{error}</Notice>}

                <div className="field">
                    <label className="label" htmlFor="edit-video-title">
                        Title
                    </label>
                    <input
                        id="edit-video-title"
                        className="input"
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                        maxLength={120}
                        required
                    />
                </div>

                <div className="field">
                    <label className="label" htmlFor="edit-video-description">
                        Description
                    </label>
                    <textarea
                        id="edit-video-description"
                        className="textarea"
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                    />
                </div>

                <FileInput
                    label="Replace thumbnail"
                    accept="image/*"
                    file={thumbnail}
                    onChange={setThumbnail}
                    hint="Leave empty to keep the current thumbnail."
                />

                <div className="edit-video__actions">
                    <button type="button" className="btn btn--ghost" onClick={onClose} disabled={saving}>
                        Cancel
                    </button>
                    <button type="submit" className="btn btn--primary" disabled={saving}>
                        {saving && <span className="spinner spinner--sm" />}
                        {saving ? "Saving…" : "Save changes"}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

const DashboardVideoRow = ({ video, onTogglePublish, onEdit, onDelete, busy }) => (
    <div className={cx("dash-video", !video.isPublished && "dash-video--draft")}>
        <Link to={`/watch/${video._id}`} className="dash-video__thumb" tabIndex={-1} aria-hidden="true">
            {video.thumbnail?.url ? (
                <img className="dash-video__img" src={video.thumbnail.url} alt="" loading="lazy" />
            ) : (
                <span className="dash-video__thumb-fallback">
                    <FilmIcon size={20} />
                </span>
            )}
        </Link>

        <div className="dash-video__body">
            <Link to={`/watch/${video._id}`} className="dash-video__title clamp-2">
                {video.title}
            </Link>
            <p className="dash-video__meta">
                {formatViews(video.views)} views · {formatDate(video.createdAt)}
            </p>
        </div>

        <span className={cx("badge", video.isPublished ? "badge--success" : "badge--warning")}>
            <span className="badge__dot" aria-hidden="true" />
            {video.isPublished ? "Published" : "Draft"}
        </span>

        <div className="dash-video__actions">
            <button
                type="button"
                className="icon-btn icon-btn--sm"
                onClick={onTogglePublish}
                disabled={busy}
                title={video.isPublished ? "Unpublish video" : "Publish video"}
                aria-label={video.isPublished ? "Unpublish video" : "Publish video"}
            >
                {busy ? <span className="spinner spinner--sm" /> : <BoltIcon size={18} />}
            </button>
            <button
                type="button"
                className="icon-btn icon-btn--sm"
                onClick={onEdit}
                title="Edit details"
                aria-label="Edit details"
            >
                <EditIcon size={18} />
            </button>
            <button
                type="button"
                className="icon-btn icon-btn--sm dash-video__delete"
                onClick={onDelete}
                title="Delete video"
                aria-label="Delete video"
            >
                <TrashIcon size={18} />
            </button>
        </div>
    </div>
);

const Dashboard = () => {
    useDocumentTitle("Dashboard");

    const [stats, setStats] = useState(null);
    const [statsError, setStatsError] = useState("");
    const [videos, setVideos] = useState([]);
    const [page, setPage] = useState(1);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [listError, setListError] = useState("");
    const [busyId, setBusyId] = useState("");
    const [notice, setNotice] = useState("");
    const [editing, setEditing] = useState(null);
    const [deleting, setDeleting] = useState(null);
    const [deleteBusy, setDeleteBusy] = useState(false);

    const loadStats = useCallback(async () => {
        try {
            const data = await dashboardApi.stats();
            setStats(data);
            setStatsError("");
        } catch (err) {
            console.error("Failed to load channel stats:", err);
            setStatsError(getErrorMessage(err, "Could not load your channel statistics"));
        }
    }, []);

    const loadVideos = useCallback(async (targetPage, append) => {
        const data = await dashboardApi.videos({ page: targetPage, limit: DASHBOARD_PAGE_SIZE });
        setVideos((current) => (append ? [...current, ...data.videos] : data.videos));
        setHasNextPage(data.videos.length === DASHBOARD_PAGE_SIZE);
        setPage(targetPage);
    }, []);

    useEffect(() => {
        let active = true;

        setLoading(true);
        setListError("");

        Promise.all([loadStats(), loadVideos(1, false)])
            .catch((err) => {
                console.error("Failed to load dashboard:", err);
                if (active) setListError(getErrorMessage(err, "Could not load your videos"));
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
        };
    }, [loadStats, loadVideos]);

    const loadMore = async () => {
        setLoadingMore(true);
        try {
            await loadVideos(page + 1, true);
        } catch (err) {
            console.error("Failed to load more videos:", err);
            setListError(getErrorMessage(err, "Could not load more videos"));
        } finally {
            setLoadingMore(false);
        }
    };

    const togglePublish = async (video) => {
        setBusyId(video._id);
        setNotice("");
        try {
            const updated = await videoApi.togglePublish(video._id);
            setVideos((current) =>
                current.map((item) => (item._id === updated._id ? { ...item, isPublished: updated.isPublished } : item))
            );
            setNotice(updated.isPublished ? "Video is now public." : "Video moved back to drafts.");
            loadStats();
        } catch (err) {
            console.error("Publish toggle failed:", err);
            setNotice(getErrorMessage(err, "Could not update the publish state"));
        } finally {
            setBusyId("");
        }
    };

    const confirmDelete = async () => {
        if (!deleting || deleteBusy) return;

        setDeleteBusy(true);
        try {
            await videoApi.remove(deleting._id);
            setVideos((current) => current.filter((item) => item._id !== deleting._id));
            setDeleting(null);
            setNotice("Video deleted from your channel.");
            loadStats();
        } catch (err) {
            console.error("Video delete failed:", err);
            setNotice(getErrorMessage(err, "Could not delete this video"));
        } finally {
            setDeleteBusy(false);
        }
    };

    return (
        <div className="dashboard">
            <PageHeader
                eyebrow="Creator studio"
                title="Channel dashboard"
                description="Live numbers from your own channel, straight from the database."
                actions={
                    <Link to="/upload" className="btn btn--primary">
                        <UploadIcon size={18} />
                        Upload video
                    </Link>
                }
            />

            <section className="dash-stats" aria-label="Channel statistics">
                {loading && !stats ? (
                    <SkeletonStats count={4} />
                ) : statsError ? (
                    <Notice tone="error">{statsError}</Notice>
                ) : (
                    <>
                        <StatCard icon={FilmIcon} label={pluralize(stats.totalVideos, "video")} value={stats.totalVideos} loading={loading} />
                        <StatCard icon={EyeIcon} label="Total views" value={formatViews(stats.totalViews)} loading={loading} />
                        <StatCard icon={DashboardIcon} label="Subscribers" value={formatViews(stats.totalSubscribers)} loading={loading} />
                        <StatCard icon={LikeVideosIcon} label="Total likes" value={formatViews(stats.totalLikes)} loading={loading} />
                    </>
                )}
            </section>

            {notice && (
                <p className="dashboard__notice" role="status">
                    <CheckIcon size={16} />
                    {notice}
                </p>
            )}

            <section className="panel dash-list">
                <h2 className="panel__title">Your videos</h2>
                <p className="panel__subtitle">Unpublish, edit or remove anything you have uploaded.</p>

                {loading ? (
                    <div className="dash-list__loading">
                        <SkeletonRow lines={2} />
                        <SkeletonRow lines={2} />
                        <SkeletonRow lines={2} />
                    </div>
                ) : listError && videos.length === 0 ? (
                    <ErrorState
                        title="Could not load your videos"
                        message={listError}
                        onRetry={() => loadVideos(1, false).catch(() => {})}
                    />
                ) : videos.length === 0 ? (
                    <EmptyState
                        icon={FilmIcon}
                        title="No videos yet"
                        description="Your uploads will appear here once you publish your first video."
                        action={
                            <Link to="/upload" className="btn btn--primary btn--sm">
                                <UploadIcon size={16} />
                                Upload your first video
                            </Link>
                        }
                    />
                ) : (
                    <div className="dash-list__items">
                        {videos.map((video) => (
                            <DashboardVideoRow
                                key={video._id}
                                video={video}
                                busy={busyId === video._id}
                                onTogglePublish={() => togglePublish(video)}
                                onEdit={() => setEditing(video)}
                                onDelete={() => setDeleting(video)}
                            />
                        ))}
                    </div>
                )}

                {hasNextPage && (
                    <div className="dash-list__more">
                        <button
                            type="button"
                            className="btn btn--outline btn--sm"
                            onClick={loadMore}
                            disabled={loadingMore}
                        >
                            {loadingMore && <span className="spinner spinner--sm" />}
                            {loadingMore ? "Loading…" : "Load more"}
                        </button>
                    </div>
                )}
            </section>

            <EditVideoModal
                open={Boolean(editing)}
                video={editing}
                onClose={() => setEditing(null)}
                onSaved={(updated) => {
                    setVideos((current) =>
                        current.map((item) =>
                            item._id === updated._id
                                ? {
                                      ...item,
                                      title: updated.title,
                                      description: updated.description,
                                      thumbnail: updated.thumbnail
                                  }
                                : item
                        )
                    );
                    setNotice("Video details updated.");
                }}
            />

            <ConfirmDialog
                open={Boolean(deleting)}
                title="Delete this video?"
                message={
                    deleting
                        ? `“${deleting.title}” will be permanently removed from Cloudinary and the database. This cannot be undone.`
                        : ""
                }
                confirmLabel="Delete video"
                busy={deleteBusy}
                onConfirm={confirmDelete}
                onClose={() => setDeleting(null)}
            />
        </div>
    );
};

export default Dashboard;
