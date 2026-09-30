import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import Avatar from "../components/Avatar";
import ConfirmDialog from "../components/ConfirmDialog";
import Modal from "../components/Modal";
import VideoCard from "../components/VideoCard";
import { EmptyState, ErrorState, Notice } from "../components/States";
import { SkeletonRow } from "../components/Skeletons";
import { CloseIcon, EditIcon, PlayIcon, PlaylistIcon, TrashIcon } from "../components/Icons";
import useAuth from "../hooks/useAuth";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { playlistApi } from "../services/endpoints";
import { getErrorMessage, getErrorStatus } from "../services/api";
import { formatDate, formatViews, pluralize } from "../utils/format";
import "./PlaylistDetail.css";

const EditPlaylistModal = ({ open, playlist, onClose, onSaved }) => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!playlist) return;
        setName(playlist.name ?? "");
        setDescription(playlist.description ?? "");
        setError("");
    }, [playlist]);

    const submit = async (event) => {
        event.preventDefault();
        if (saving || !playlist) return;

        setSaving(true);
        setError("");

        try {
            const updated = await playlistApi.update(playlist._id, {
                name: name.trim(),
                description: description.trim()
            });
            onSaved(updated);
            onClose();
        } catch (err) {
            console.error("Playlist update failed:", err);
            setError(getErrorMessage(err, "Could not save your changes"));
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal open={open} onClose={onClose} title="Edit playlist">
            <form className="pl-edit" onSubmit={submit}>
                {error && <Notice tone="error">{error}</Notice>}

                <div className="field">
                    <label className="label" htmlFor="pl-edit-name">
                        Name
                    </label>
                    <input
                        id="pl-edit-name"
                        className="input"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        maxLength={80}
                        required
                    />
                </div>

                <div className="field">
                    <label className="label" htmlFor="pl-edit-description">
                        Description
                    </label>
                    <textarea
                        id="pl-edit-description"
                        className="textarea"
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                    />
                </div>

                <div className="pl-edit__actions">
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

const PlaylistDetail = () => {
    const { playlistId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [playlist, setPlaylist] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [notFound, setNotFound] = useState(false);
    const [busyVideo, setBusyVideo] = useState("");
    const [notice, setNotice] = useState("");
    const [editing, setEditing] = useState(false);
    const [confirmingDelete, setConfirmingDelete] = useState(false);
    const [deleteBusy, setDeleteBusy] = useState(false);

    useDocumentTitle(playlist ? playlist.name : "Playlist");

    const load = useCallback(async () => {
        setLoading(true);
        setError("");
        setNotFound(false);

        try {
            const data = await playlistApi.byId(playlistId);
            setPlaylist(data);
        } catch (err) {
            console.error("Failed to load playlist:", err);
            if (getErrorStatus(err) === 404) setNotFound(true);
            setError(getErrorMessage(err, "Could not load this playlist"));
        } finally {
            setLoading(false);
        }
    }, [playlistId]);

    useEffect(() => {
        load();
    }, [load]);

    const removeVideo = async (video) => {
        if (busyVideo) return;

        setBusyVideo(video._id);
        setNotice("");

        try {
            const updated = await playlistApi.removeVideo(playlist._id, video._id);
            setPlaylist((current) => ({ ...current, ...updated }));
            setNotice(`Removed “${video.title}”`);
        } catch (err) {
            console.error("Failed to remove video from playlist:", err);
            setNotice(getErrorMessage(err, "Could not remove this video"));
        } finally {
            setBusyVideo("");
        }
    };

    const deletePlaylist = async () => {
        if (deleteBusy) return;

        setDeleteBusy(true);
        try {
            await playlistApi.remove(playlist._id);
            navigate("/playlists", { replace: true });
        } catch (err) {
            console.error("Failed to delete playlist:", err);
            setNotice(getErrorMessage(err, "Could not delete this playlist"));
            setConfirmingDelete(false);
        } finally {
            setDeleteBusy(false);
        }
    };

    if (loading) {
        return (
            <div className="pl-detail">
                <div className="skeleton pl-detail__line pl-detail__line--title" />
                <div className="skeleton pl-detail__line pl-detail__line--short" />
                <div className="pl-detail__list">
                    <SkeletonRow lines={2} />
                    <SkeletonRow lines={2} />
                    <SkeletonRow lines={2} />
                </div>
            </div>
        );
    }

    if (notFound) {
        return (
            <ErrorState
                title="Playlist not found"
                message="It may have been deleted, or the link is incorrect."
                action={
                    <Link to="/playlists" className="btn btn--outline btn--sm">
                        Back to playlists
                    </Link>
                }
            />
        );
    }

    if (error || !playlist) {
        return <ErrorState title="Unable to load this playlist" message={error} onRetry={load} />;
    }

    const videos = playlist.videos ?? [];
    const isOwner = user?._id && String(playlist.owner?._id ?? playlist.owner) === String(user._id);

    return (
        <div className="pl-detail">
            <PageHeader
                eyebrow={isOwner ? "Your playlist" : "Playlist"}
                title={playlist.name}
                description={playlist.description}
            >
                <p className="pl-detail__meta">
                    {playlist.owner?.fullName || playlist.owner?.username || "Unknown owner"}
                    {playlist.createdAt ? ` · Created ${formatDate(playlist.createdAt)}` : ""}
                </p>
            </PageHeader>

            <div className="pl-detail__toolbar">
                <div className="pl-detail__owner">
                    <Avatar user={playlist.owner} size={40} />
                    <div>
                        <p className="pl-detail__owner-name">
                            {playlist.owner?.fullName || playlist.owner?.username || "Unknown owner"}
                        </p>
                        <p className="pl-detail__owner-meta">
                            {pluralize(videos.length, "video")}
                            {videos.length > 0
                                ? ` · ${formatViews(videos.reduce((total, video) => total + (video.views ?? 0), 0))} views`
                                : ""}
                        </p>
                    </div>
                </div>

                <div className="pl-detail__actions">
                    {videos.length > 0 && (
                        <Link to={`/watch/${videos[0]._id}`} className="btn btn--primary">
                            <PlayIcon size={18} />
                            Play first
                        </Link>
                    )}

                    {isOwner && (
                        <>
                            <button type="button" className="btn btn--outline" onClick={() => setEditing(true)}>
                                <EditIcon size={18} />
                                Edit
                            </button>
                            <button
                                type="button"
                                className="btn btn--ghost pl-detail__delete"
                                onClick={() => setConfirmingDelete(true)}
                            >
                                <TrashIcon size={18} />
                                Delete
                            </button>
                        </>
                    )}
                </div>
            </div>

            {notice && <Notice tone="info">{notice}</Notice>}

            {videos.length === 0 ? (
                <EmptyState
                    icon={PlaylistIcon}
                    title="This playlist is empty"
                    description="Use the “Save” button on any video to add it here."
                    action={
                        <Link to="/" className="btn btn--primary btn--sm">
                            Browse videos
                        </Link>
                    }
                />
            ) : (
                <div className="pl-detail__list">
                    {videos.map((video, index) => (
                        <VideoCard
                            key={video._id}
                            video={video}
                            variant="row"
                            eager={index < 3}
                            actions={
                                isOwner && (
                                    <button
                                        type="button"
                                        className="icon-btn icon-btn--sm"
                                        onClick={() => removeVideo(video)}
                                        disabled={busyVideo === video._id}
                                        title="Remove from playlist"
                                        aria-label={`Remove ${video.title} from this playlist`}
                                    >
                                        {busyVideo === video._id ? (
                                            <span className="spinner spinner--sm" />
                                        ) : (
                                            <CloseIcon size={18} />
                                        )}
                                    </button>
                                )
                            }
                        />
                    ))}
                </div>
            )}

            <EditPlaylistModal
                open={editing}
                playlist={playlist}
                onClose={() => setEditing(false)}
                onSaved={(updated) => {
                    setPlaylist((current) => ({ ...current, ...updated }));
                    setNotice("Playlist updated.");
                }}
            />

            <ConfirmDialog
                open={confirmingDelete}
                title="Delete this playlist?"
                message={`“${playlist.name}” will be removed permanently. The videos inside it are not deleted.`}
                confirmLabel="Delete playlist"
                busy={deleteBusy}
                onConfirm={deletePlaylist}
                onClose={() => setConfirmingDelete(false)}
            />
        </div>
    );
};

export default PlaylistDetail;
