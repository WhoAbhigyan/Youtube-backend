import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import Modal from "../components/Modal";
import { ErrorState, NoPlaylists, Notice } from "../components/States";
import { SkeletonCard } from "../components/Skeletons";
import { FilmIcon, PlaylistIcon, PlusIcon } from "../components/Icons";
import useAuth from "../hooks/useAuth";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { playlistApi } from "../services/endpoints";
import { getErrorMessage } from "../services/api";
import { formatDate, pluralize } from "../utils/format";
import "./Playlists.css";

const PlaylistCard = ({ playlist }) => {
    const count = playlist.videos?.length ?? 0;

    return (
        <Link to={`/playlist/${playlist._id}`} className="pl-card">
            <span className="pl-card__thumb" aria-hidden="true">
                <PlaylistIcon size={26} />
                <span className="pl-card__count">{count}</span>
            </span>

            <span className="pl-card__body">
                <span className="pl-card__name clamp-2">{playlist.name}</span>
                {playlist.description && (
                    <span className="pl-card__description clamp-2">{playlist.description}</span>
                )}
                <span className="pl-card__meta">
                    {pluralize(count, "video")}
                    {playlist.createdAt ? ` · ${formatDate(playlist.createdAt)}` : ""}
                </span>
            </span>
        </Link>
    );
};

const CreatePlaylistModal = ({ open, onClose, onCreated }) => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!open) return;
        setName("");
        setDescription("");
        setError("");
    }, [open]);

    const submit = async (event) => {
        event.preventDefault();
        if (saving) return;

        setSaving(true);
        setError("");

        try {
            const playlist = await playlistApi.create({ name: name.trim(), description: description.trim() });
            onCreated(playlist);
            onClose();
        } catch (err) {
            console.error("Playlist creation failed:", err);
            setError(getErrorMessage(err, "Could not create the playlist"));
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal open={open} onClose={onClose} title="New playlist" description="Both fields are required by the backend.">
            <form className="pl-create" onSubmit={submit}>
                {error && <Notice tone="error">{error}</Notice>}

                <div className="field">
                    <label className="label" htmlFor="playlist-name">
                        Name
                    </label>
                    <input
                        id="playlist-name"
                        className="input"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        placeholder="Weekend watchlist"
                        maxLength={80}
                        required
                    />
                </div>

                <div className="field">
                    <label className="label" htmlFor="playlist-description">
                        Description
                    </label>
                    <textarea
                        id="playlist-description"
                        className="textarea"
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        placeholder="What is this collection for?"
                        required
                    />
                </div>

                <div className="pl-create__actions">
                    <button type="button" className="btn btn--ghost" onClick={onClose} disabled={saving}>
                        Cancel
                    </button>
                    <button type="submit" className="btn btn--primary" disabled={saving}>
                        {saving && <span className="spinner spinner--sm" />}
                        {saving ? "Creating…" : "Create playlist"}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

const Playlists = () => {
    useDocumentTitle("Playlists");

    const { user } = useAuth();
    const userId = user?._id;
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [creating, setCreating] = useState(false);

    const load = useCallback(async () => {
        if (!userId) return;

        setLoading(true);
        setError("");

        try {
            const data = await playlistApi.listForUser(userId);
            setPlaylists(data);
        } catch (err) {
            console.error("Failed to load playlists:", err);
            setError(getErrorMessage(err, "Could not load your playlists"));
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        load();
    }, [load]);

    return (
        <div className="playlists">
            <PageHeader
                eyebrow="Your library"
                title="Playlists"
                description="Collections stored in your account. Only you can see them."
                actions={
                    <button type="button" className="btn btn--primary" onClick={() => setCreating(true)}>
                        <PlusIcon size={18} />
                        New playlist
                    </button>
                }
            />

            {loading ? (
                <div className="playlists__grid">
                    {[0, 1, 2, 3].map((index) => (
                        <SkeletonCard key={index} />
                    ))}
                </div>
            ) : error && playlists.length === 0 ? (
                <ErrorState title="Could not load playlists" message={error} onRetry={load} />
            ) : playlists.length === 0 ? (
                <NoPlaylists
                    action={
                        <button type="button" className="btn btn--primary btn--sm" onClick={() => setCreating(true)}>
                            <PlusIcon size={16} />
                            Create your first playlist
                        </button>
                    }
                />
            ) : (
                <>
                    <div className="playlists__grid">
                        {playlists.map((playlist) => (
                            <PlaylistCard key={playlist._id} playlist={playlist} />
                        ))}
                    </div>

                    <p className="playlists__hint">
                        <FilmIcon size={16} />
                        Save any video from the player with the “Save” button to fill these playlists.
                    </p>
                </>
            )}

            <CreatePlaylistModal
                open={creating}
                onClose={() => setCreating(false)}
                onCreated={(playlist) => setPlaylists((current) => [playlist, ...current])}
            />
        </div>
    );
};

export default Playlists;
