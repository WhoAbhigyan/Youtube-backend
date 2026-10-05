import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Avatar from "../components/Avatar";
import VideoCard from "../components/VideoCard";
import VideoActions from "../components/VideoActions";
import SubscribeButton from "../components/SubscribeButton";
import CommentSection from "../components/CommentSection";
import { ErrorState } from "../components/States";
import { SkeletonRow } from "../components/Skeletons";
import { CloseIcon, FilmIcon } from "../components/Icons";
import useAuth from "../hooks/useAuth";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { authApi, videoApi } from "../services/endpoints";
import { getErrorMessage, getErrorStatus } from "../services/api";
import {
    cx,
    formatDate,
    formatDuration,
    formatViews,
    pluralize
} from "../utils/format";
import "./WatchVideo.css";

const WatchVideo = () => {
    const { videoId } = useParams();
    const { user } = useAuth();

    const [video, setVideo] = useState(null);
    const [channel, setChannel] = useState(null);
    const [related, setRelated] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [notFound, setNotFound] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [relatedLoading, setRelatedLoading] = useState(true);

    // Prevent multiple history requests
    const historyAdded = useRef(false);

    useDocumentTitle(video?.title ?? "Watch");

    useEffect(() => {
        let active = true;

        setLoading(true);
        setError("");
        setNotFound(false);
        setVideo(null);
        setChannel(null);
        setExpanded(false);
        historyAdded.current = false;

        window.scrollTo({ top: 0 });

        videoApi
            .byId(videoId)
            .then(async (data) => {
                if (!active) return;

                setVideo(data);

                if (data.owner?.username) {
                    try {
                        const profile = await authApi.channel(
                            data.owner.username
                        );

                        if (active) setChannel(profile);
                    } catch (err) {
                        console.warn(
                            "Channel profile unavailable:",
                            getErrorMessage(err)
                        );
                    }
                }
            })
            .catch((err) => {
                console.error("Failed to load video:", err);

                if (!active) return;

                if (getErrorStatus(err) === 404) {
                    setNotFound(true);
                }

                setError(
                    getErrorMessage(
                        err,
                        "Unable to load this video"
                    )
                );
            })
            .finally(() => {
                if (active) {
                    setLoading(false);
                }
            });

        return () => {
            active = false;
        };
    }, [videoId]);

    const loadRelated = useCallback(async () => {
        setRelatedLoading(true);

        try {
            const data = await videoApi.feed({
                page: 1,
                limit: 12
            });

            setRelated(
                data.videos.filter(
                    (item) => item._id !== videoId
                )
            );
        } catch (err) {
            console.error(
                "Failed to load recommendations:",
                err
            );
        } finally {
            setRelatedLoading(false);
        }
    }, [videoId]);

    useEffect(() => {
        loadRelated();
    }, [loadRelated]);

    // ADD VIDEO TO WATCH HISTORY
    const handleVideoPlay = async () => {
        if (historyAdded.current) {
            return;
        }

        historyAdded.current = true;

        try {
            await authApi.addToWatchHistory(videoId);

            console.log("Added to watch history");
        } catch (err) {
            console.error(
                "Failed to add watch history:",
                getErrorMessage(err)
            );

            // Allow another attempt if request fails
            historyAdded.current = false;
        }
    };

    if (loading) {
        return (
            <div className="watch watch--loading">
                <div className="watch__primary">
                    <div className="skeleton watch__player-skeleton" />

                    <div className="watch__meta-skeleton">
                        <SkeletonRow lines={1} />
                        <SkeletonRow lines={1} />
                    </div>
                </div>

                <aside className="watch__secondary">
                    <SkeletonRow lines={2} />
                    <SkeletonRow lines={2} />
                    <SkeletonRow lines={2} />
                </aside>
            </div>
        );
    }

    if (notFound) {
        return (
            <ErrorState
                title="Video not found"
                message="This video may have been removed by its creator."
            />
        );
    }

    if (error || !video) {
        return (
            <ErrorState
                title="Unable to load this video"
                message={error}
                onRetry={() => window.location.reload()}
            />
        );
    }

    const isOwner =
        user &&
        channel &&
        channel._id === user._id;

    return (
        <div className="watch">

            <div className="watch__primary">

                <div className="watch__player">

                    <video
                        className="watch__video"
                        controls
                        playsInline
                        preload="metadata"
                        poster={video.thumbnail?.url}
                        src={video.videoFile?.url}
                        onPlay={handleVideoPlay}
                    >
                        Your browser does not support embedded videos.
                    </video>

                </div>

                <h1 className="watch__title">
                    {video.title}
                </h1>

                <div className="watch__meta">

                    <span className="badge">
                        {formatViews(video.views)} views
                    </span>

                    <span
                        className="watch__meta-sep"
                        aria-hidden="true"
                    >
                        •
                    </span>

                    <span>
                        {formatDate(video.createdAt)}
                    </span>

                    {video.duration ? (
                        <>
                            <span
                                className="watch__meta-sep"
                                aria-hidden="true"
                            >
                                •
                            </span>

                            <span>
                                {formatDuration(video.duration)}
                            </span>
                        </>
                    ) : null}

                </div>

                <div className="watch__row">

                    <div className="watch__channel">

                        <Avatar
                            user={video.owner}
                            size={44}
                            to={`/channel/${video.owner?.username}`}
                        />

                        <div className="watch__channel-text">

                            <Link
                                to={`/channel/${video.owner?.username}`}
                                className="watch__channel-name"
                            >
                                {video.owner?.fullName ??
                                    "Unknown channel"}
                            </Link>

                            <span className="watch__channel-handle">
                                @{video.owner?.username ?? "unknown"}

                                {channel
                                    ? ` · ${formatViews(
                                          channel.subscribersCount
                                      )} subscribers`
                                    : ""}
                            </span>

                        </div>

                    </div>

                    <div className="watch__row-actions">

                        <VideoActions video={video} />

                        {channel && !isOwner && (
                            <SubscribeButton
                                channelId={channel._id}
                                initialSubscribed={
                                    channel.isSubscribed
                                }
                            />
                        )}

                    </div>

                </div>

                <div
                    className={cx(
                        "watch__description",
                        expanded &&
                            "watch__description--expanded"
                    )}
                >

                    <p className="watch__description-head">
                        {formatViews(video.views)} views ·{" "}
                        {formatDate(video.createdAt)}
                    </p>

                    <p className="watch__description-text">
                        {video.description ||
                            "No description provided for this video."}
                    </p>

                    <button
                        type="button"
                        className="watch__description-toggle"
                        onClick={() =>
                            setExpanded((value) => !value)
                        }
                        aria-expanded={expanded}
                    >
                        {expanded
                            ? "Show less"
                            : "Show more"}

                        <CloseIcon
                            size={14}
                            className={cx(
                                "watch__toggle-icon",
                                expanded &&
                                    "watch__toggle-icon--open"
                            )}
                        />
                    </button>

                </div>

                <CommentSection videoId={video._id} />

            </div>

            <aside
                className="watch__secondary"
                aria-label="Recommended videos"
            >

                {relatedLoading ? (
                    <>
                        <SkeletonRow lines={2} />
                        <SkeletonRow lines={2} />
                        <SkeletonRow lines={2} />
                    </>
                ) : related.length === 0 ? (
                    <div className="watch__secondary-empty">
                        <FilmIcon size={26} />

                        <p>
                            No other videos to recommend yet.
                        </p>
                    </div>
                ) : (
                    <>
                        <p className="watch__secondary-title">
                            Up next ·{" "}
                            {pluralize(
                                related.length,
                                "video"
                            )}
                        </p>

                        {related.map((item) => (
                            <VideoCard
                                key={item._id}
                                video={item}
                                variant="compact"
                            />
                        ))}
                    </>
                )}

            </aside>

        </div>
    );
};

export default WatchVideo;