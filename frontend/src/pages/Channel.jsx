import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Avatar from "../components/Avatar";
import SubscribeButton from "../components/SubscribeButton";
import VideoGrid from "../components/VideoGrid";
import { EmptyState, ErrorState } from "../components/States";
import { SkeletonCard, SkeletonGrid } from "../components/Skeletons";
import { FilmIcon, PlaylistIcon } from "../components/Icons";
import useAuth from "../hooks/useAuth";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { authApi, playlistApi, videoApi } from "../services/endpoints";
import { getErrorMessage, getErrorStatus } from "../services/api";
import { cx, formatDate, formatViews, pluralize } from "../utils/format";
import "./Channel.css";

const CHANNEL_PAGE_SIZE = 12;

const TABS = [
    { id: "videos", label: "Videos", icon: FilmIcon },
    { id: "playlists", label: "Playlists", icon: PlaylistIcon }
];

const PlaylistTile = ({ playlist }) => {
    const videos = playlist.videos ?? [];

    return (
        <Link to={`/playlist/${playlist._id}`} className="chan-playlist">
            <span className="chan-playlist__stack" aria-hidden="true">
                {videos.slice(0, 3).map((video, index) => (
                    <span
                        key={video._id ?? index}
                        className="chan-playlist__thumb"
                        style={{ backgroundImage: video?.thumbnail?.url ? `url(${video.thumbnail.url})` : undefined }}
                    >
                        {!video?.thumbnail?.url && <FilmIcon size={18} />}
                    </span>
                ))}
                {videos.length === 0 && (
                    <span className="chan-playlist__thumb chan-playlist__thumb--empty">
                        <PlaylistIcon size={18} />
                    </span>
                )}
            </span>

            <span className="chan-playlist__body">
                <span className="chan-playlist__name clamp-2">{playlist.name}</span>
                <span className="chan-playlist__meta">
                    {pluralize(videos.length, "video")}
                    {playlist.createdAt ? ` · ${formatDate(playlist.createdAt)}` : ""}
                </span>
                {playlist.description && (
                    <span className="chan-playlist__description clamp-2">{playlist.description}</span>
                )}
            </span>
        </Link>
    );
};

const Channel = () => {
    const { username } = useParams();
    const { user } = useAuth();

    const [channel, setChannel] = useState(null);
    const [tab, setTab] = useState("videos");
    const [videos, setVideos] = useState([]);
    const [page, setPage] = useState(1);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [playlists, setPlaylists] = useState([]);
    const [playlistsLoading, setPlaylistsLoading] = useState(true);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState("");
    const [notFound, setNotFound] = useState(false);
    const [listError, setListError] = useState("");

    useDocumentTitle(channel ? channel.fullName : "Channel");

    const loadChannel = useCallback(async () => {
        setLoading(true);
        setError("");
        setNotFound(false);
        setVideos([]);
        setTab("videos");

        try {
            const profile = await authApi.channel(username);
            setChannel(profile);
            window.scrollTo({ top: 0 });

            const data = await videoApi.feed({ page: 1, limit: CHANNEL_PAGE_SIZE, owner: profile._id });
            setVideos(data.videos);
            setHasNextPage(data.page < data.totalPages);

            setPlaylistsLoading(true);
            try {
                const list = await playlistApi.listForUser(profile._id);
                setPlaylists(list);
            } catch (err) {
                console.error("Failed to load channel playlists:", err);
                setPlaylists([]);
            } finally {
                setPlaylistsLoading(false);
            }
        } catch (err) {
            console.error("Failed to load channel:", err);
            if (getErrorStatus(err) === 404) setNotFound(true);
            setError(getErrorMessage(err, "Could not load this channel"));
            setPlaylistsLoading(false);
        } finally {
            setLoading(false);
        }
    }, [username]);

    useEffect(() => {
        loadChannel();
    }, [loadChannel]);

    const loadMore = async () => {
        setLoadingMore(true);
        try {
            const data = await videoApi.feed({
                page: page + 1,
                limit: CHANNEL_PAGE_SIZE,
                owner: channel._id
            });
            setVideos((current) => [...current, ...data.videos]);
            setPage(data.page);
            setHasNextPage(data.page < data.totalPages);
        } catch (err) {
            console.error("Failed to load more channel videos:", err);
            setListError(getErrorMessage(err, "Could not load more videos"));
        } finally {
            setLoadingMore(false);
        }
    };

    if (loading) {
        return (
            <div className="channel">
                <div className="channel__hero-skeleton">
                    <div className="skeleton channel__cover-skeleton" />
                    <div className="channel__identity-skeleton">
                        <div className="skeleton channel__avatar-skeleton" />
                        <div className="channel__lines">
                            <div className="skeleton channel__line" />
                            <div className="skeleton channel__line channel__line--short" />
                        </div>
                    </div>
                </div>
                <SkeletonGrid count={6} />
            </div>
        );
    }

    if (notFound) {
        return (
            <ErrorState
                title="Channel not found"
                message={`No channel exists with the handle “${username}”.`}
                action={
                    <Link to="/" className="btn btn--outline btn--sm">
                        Back to home
                    </Link>
                }
            />
        );
    }

    if (error || !channel) {
        return <ErrorState title="Unable to load this channel" message={error} onRetry={loadChannel} />;
    }

    const isOwner = user?._id === channel._id;

    return (
        <div className="channel">
            <header className="channel__hero">
                {channel.coverImage?.url ? (
                    <img className="channel__cover" src={channel.coverImage.url} alt="" />
                ) : (
                    <span className="channel__cover channel__cover--empty" aria-hidden="true" />
                )}

                <div className="channel__identity">
                    <Avatar user={channel} size={92} className="channel__avatar" />

                    <div className="channel__text">
                        <h1 className="channel__name">{channel.fullName}</h1>
                        <p className="channel__handle">
                            @{channel.username} <span aria-hidden="true">·</span>{" "}
                            {formatViews(channel.subscribersCount)} subscribers
                            {channel.channelsSubscriberToCount
                                ? ` · ${formatViews(channel.channelsSubscriberToCount)} channels`
                                : ""}
                        </p>
                    </div>

                    <div className="channel__cta">
                        {isOwner ? (
                            <Link to="/dashboard" className="btn btn--outline">
                                Manage channel
                            </Link>
                        ) : (
                            <SubscribeButton channelId={channel._id} initialSubscribed={channel.isSubscribed} />
                        )}
                    </div>
                </div>
            </header>

            <nav className={cx("channel__tabs", "chip-row")} aria-label="Channel sections">
                {TABS.map(({ id, label, icon: Icon }) => (
                    <button
                        key={id}
                        type="button"
                        className="chip channel__tab"
                        aria-pressed={tab === id}
                        onClick={() => setTab(id)}
                    >
                        <Icon size={16} />
                        {label}
                    </button>
                ))}
            </nav>

            {tab === "videos" ? (
                <>
                    {videos.length === 0 ? (
                        <EmptyState
                            icon={FilmIcon}
                            title={isOwner ? "You have not published any videos" : "This channel has no videos"}
                            description={
                                isOwner
                                    ? "Upload your first video and it will show up here."
                                    : "When this creator publishes something, it will appear here."
                            }
                            action={
                                isOwner && (
                                    <Link to="/upload" className="btn btn--primary btn--sm">
                                        Upload a video
                                    </Link>
                                )
                            }
                        />
                    ) : (
                        <VideoGrid videos={videos} layout="grid" showChannel={false} />
                    )}

                    {hasNextPage && (
                        <div className="channel__more">
                            <button
                                type="button"
                                className="btn btn--outline btn--sm"
                                onClick={loadMore}
                                disabled={loadingMore}
                            >
                                {loadingMore && <span className="spinner spinner--sm" />}
                                {loadingMore ? "Loading…" : "Load more videos"}
                            </button>
                        </div>
                    )}

                    {listError && <p className="channel__error">{listError}</p>}
                </>
            ) : playlistsLoading ? (
                <div className="channel__playlists-grid">
                    {[0, 1, 2].map((index) => (
                        <SkeletonCard key={index} />
                    ))}
                </div>
            ) : playlists.length === 0 ? (
                <EmptyState
                    icon={PlaylistIcon}
                    title="No public playlists"
                    description={
                        isOwner
                            ? "Playlists are private to you — open them from the Playlists page to manage them."
                            : "This creator has not shared any playlists."
                    }
                />
            ) : (
                <div className="channel__playlists-grid">
                    {playlists.map((playlist) => (
                        <PlaylistTile key={playlist._id} playlist={playlist} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Channel;
