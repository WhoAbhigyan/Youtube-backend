import { useCallback, useEffect, useRef, useState } from "react";
import Modal from "./Modal";
import { Notice } from "./States";
import { CheckIcon, CloseIcon, PlaylistIcon, PlusIcon } from "./Icons";
import { playlistApi } from "../services/endpoints";
import { getErrorMessage } from "../services/api";
import useAuth from "../hooks/useAuth";
import { cx, formatDate } from "../utils/format";
import "./SaveToPlaylist.css";

/** "Save to playlist" — backed by POST /playlist/add/:playlistId/:videoId */
const SaveToPlaylist = ({ videoId, open, onClose, onSaved }) => {
    const { user } = useAuth();
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [pendingId, setPendingId] = useState("");
    const [creating, setCreating] = useState(false);
    const [newName, setNewName] = useState("");
    const [newDescription, setNewDescription] = useState("");
    const [createError, setCreateError] = useState("");
    const [createPending, setCreatePending] = useState(false);
    const nameRef = useRef(null);

    const loadPlaylists = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        setError("");
        try {
            const data = await playlistApi.listForUser(user._id);
            setPlaylists(data || []);
        } catch (err) {
            console.error("Failed to load playlists:", err);
            setError(getErrorMessage(err, "Could not load your playlists"));
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (open) loadPlaylists();
    }, [open, loadPlaylists]);

    const addToPlaylist = async (playlist) => {
        if (pendingId) return;
        setPendingId(playlist._id);
        setError("");

        try {
            await playlistApi.addVideo(playlist._id, videoId);
            onSaved?.(playlist);
            onClose();
        } catch (err) {
            console.error("Failed to save to playlist:", err);
            setError(getErrorMessage(err, "Could not add the video to that playlist"));
        } finally {
            setPendingId("");
        }
    };

    const createPlaylist = async (event) => {
        event.preventDefault();
        setCreateError("");

        if (!newName.trim()) {
            setCreateError("Give the playlist a name");
            return;
        }
        if (!newDescription.trim()) {
            setCreateError("Add a short description");
            return;
        }

        setCreatePending(true);
        try {
            const playlist = await playlistApi.create({
                name: newName.trim(),
                description: newDescription.trim()
            });
            setPlaylists((current) => [playlist, ...current]);
            setNewName("");
            setNewDescription("");
            setCreating(false);
            await addToPlaylist(playlist);
        } catch (err) {
            console.error("Failed to create playlist:", err);
            setCreateError(getErrorMessage(err, "Could not create the playlist"));
        } finally {
            setCreatePending(false);
        }
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Save to playlist"
            description="Add this video to one of your playlists."
            labelledBy="save-playlist-title"
        >
            {error && (
                <div className="save-error">
                    <Notice tone="error">{error}</Notice>
                </div>
            )}

            {loading ? (
                <ul className="save-list">
                    {[0, 1, 2].map((index) => (
                        <li key={index} className="save-list__item">
                            <span className="skeleton save-list__icon" />
                            <span className="save-list__text">
                                <span className="skeleton save-list__line" />
                                <span className="skeleton save-list__line save-list__line--short" />
                            </span>
                        </li>
                    ))}
                </ul>
            ) : playlists.length === 0 && !creating ? (
                <div className="save-empty">
                    <span className="save-empty__icon">
                        <PlaylistIcon size={26} />
                    </span>
                    <p>You have no playlists yet.</p>
                    <button
                        type="button"
                        className="btn btn--outline btn--sm"
                        onClick={() => {
                            setCreating(true);
                            requestAnimationFrame(() => nameRef.current?.focus());
                        }}
                    >
                        <PlusIcon size={16} />
                        New playlist
                    </button>
                </div>
            ) : (
                <ul className="save-list">
                    {playlists.map((playlist) => {
                        const already = (playlist.videos || []).some((id) => id === videoId);
                        return (
                            <li key={playlist._id} className="save-list__item">
                                <span className="save-list__icon">
                                    <PlaylistIcon size={18} />
                                </span>
                                <span className="save-list__text">
                                    <span className="save-list__name truncate">{playlist.name}</span>
                                    <span className="save-list__meta">
                                        {playlist.videos?.length || 0} videos · {formatDate(playlist.createdAt)}
                                    </span>
                                </span>
                                {already ? (
                                    <span className="save-list__state">
                                        <CheckIcon size={16} /> Saved
                                    </span>
                                ) : (
                                    <button
                                        type="button"
                                        className="btn btn--sm btn--outline"
                                        onClick={() => addToPlaylist(playlist)}
                                        disabled={pendingId === playlist._id}
                                    >
                                        {pendingId === playlist._id && <span className="spinner spinner--sm" />}
                                        Add
                                    </button>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}

            {creating && (
                <form className={cx("save-create")} onSubmit={createPlaylist}>
                    <div className="field">
                        <label className="label" htmlFor="new-playlist-name">
                            Playlist name
                        </label>
                        <input
                            id="new-playlist-name"
                            ref={nameRef}
                            className="input"
                            value={newName}
                            onChange={(event) => setNewName(event.target.value)}
                            placeholder="Watch later"
                        />
                    </div>
                    <div className="field">
                        <label className="label" htmlFor="new-playlist-description">
                            Description
                        </label>
                        <textarea
                            id="new-playlist-description"
                            className="textarea save-create__textarea"
                            value={newDescription}
                            onChange={(event) => setNewDescription(event.target.value)}
                            placeholder="What is this playlist for?"
                        />
                    </div>

                    {createError && <p className="error-text">{createError}</p>}

                    <div className="save-create__actions">
                        <button
                            type="button"
                            className="btn btn--ghost btn--sm"
                            onClick={() => setCreating(false)}
                            disabled={createPending}
                        >
                            <CloseIcon size={16} />
                            Cancel
                        </button>
                        <button type="submit" className="btn btn--primary btn--sm" disabled={createPending}>
                            {createPending && <span className="spinner spinner--sm" />}
                            Create &amp; add
                        </button>
                    </div>
                </form>
            )}

            {!creating && playlists.length > 0 && (
                <button
                    type="button"
                    className="btn btn--ghost btn--sm save-new"
                    onClick={() => {
                        setCreating(true);
                        requestAnimationFrame(() => nameRef.current?.focus());
                    }}
                >
                    <PlusIcon size={16} />
                    New playlist
                </button>
            )}
        </Modal>
    );
};

export default SaveToPlaylist;
