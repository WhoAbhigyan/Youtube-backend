import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import Avatar from "../components/Avatar";
import SubscribeButton from "../components/SubscribeButton";
import VideoGrid from "../components/VideoGrid";
import { EmptyState, ErrorState } from "../components/States";
import { SkeletonRow } from "../components/Skeletons";
import { SubscriptionsIcon } from "../components/Icons";
import useAuth from "../hooks/useAuth";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { subscriptionApi, videoApi } from "../services/endpoints";
import { getErrorMessage } from "../services/api";
import { formatViews, pluralize } from "../utils/format";
import "./Subscriptions.css";

const MAX_VIDEOS_PER_CHANNEL = 3;

const Subscriptions = () => {
    useDocumentTitle("Subscriptions");

    const { user } = useAuth();
    const userId = user?._id;
    const [subscriptions, setSubscriptions] = useState([]);
    const [videosByOwner, setVideosByOwner] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [openChannels, setOpenChannels] = useState({});

    const load = useCallback(async () => {
        if (!userId) return;

        setLoading(true);
        setError("");

        try {
            const list = await subscriptionApi.channels(userId);
            setSubscriptions(list);

            // one feed request, then bucketed per channel — the backend has no
            // "videos by channel" endpoint other than the feed's owner filter
            if (list.length > 0) {
                const feed = await videoApi.feed({ page: 1, limit: 48 });
                const buckets = {};
                feed.videos.forEach((video) => {
                    const ownerId = video.owner?._id;
                    if (!ownerId) return;
                    buckets[ownerId] = buckets[ownerId] ? [...buckets[ownerId], video] : [video];
                });
                setVideosByOwner(buckets);
            } else {
                setVideosByOwner({});
            }
        } catch (err) {
            console.error("Failed to load subscriptions:", err);
            setError(getErrorMessage(err, "Could not load your subscriptions"));
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        load();
    }, [load]);

    const toggleOpen = (channelId) => {
        setOpenChannels((current) => ({ ...current, [channelId]: !current[channelId] }));
    };

    return (
        <div className="subs">
            <PageHeader
                eyebrow="Your feed"
                title="Subscriptions"
                description="Every channel you follow, with their latest published videos."
            />

            {loading ? (
                <div className="subs__list">
                    <SkeletonRow lines={2} />
                    <SkeletonRow lines={2} />
                    <SkeletonRow lines={2} />
                </div>
            ) : error && subscriptions.length === 0 ? (
                <ErrorState title="Could not load your subscriptions" message={error} onRetry={load} />
            ) : subscriptions.length === 0 ? (
                <EmptyState
                    icon={SubscriptionsIcon}
                    title="You are not subscribed to anyone yet"
                    description="Subscribe to a channel from the watch page and its videos will show up here."
                    action={
                        <Link to="/" className="btn btn--primary btn--sm">
                            Find channels
                        </Link>
                    }
                />
            ) : (
                <div className="subs__list">
                    {subscriptions.map((subscription) => {
                        const channel = subscription.channel;
                        if (!channel) return null;

                        const channelId = channel._id;
                        const videos = videosByOwner[channelId] ?? [];
                        const isOpen = Boolean(openChannels[channelId]);
                        const visible = isOpen ? videos : videos.slice(0, MAX_VIDEOS_PER_CHANNEL);

                        return (
                            <article key={subscription._id} className="sub">
                                <header className="sub__head">
                                    <Link to={`/channel/${channel.username}`} className="sub__identity">
                                        <Avatar user={channel} size={56} />
                                        <span className="sub__text">
                                            <span className="sub__name">{channel.fullName}</span>
                                            <span className="sub__handle">
                                                @{channel.username} <span aria-hidden="true">·</span>{" "}
                                                {pluralize(videos.length, "recent video")}
                                            </span>
                                        </span>
                                    </Link>

                                    <div className="sub__actions">
                                        <SubscribeButton
                                            channelId={channelId}
                                            initialSubscribed
                                            onChange={(next) => {
                                                if (!next) {
                                                    setSubscriptions((current) =>
                                                        current.filter((item) => item.channel?._id !== channelId)
                                                    );
                                                }
                                            }}
                                        />
                                        {videos.length > MAX_VIDEOS_PER_CHANNEL && (
                                            <button
                                                type="button"
                                                className="btn btn--ghost btn--sm"
                                                onClick={() => toggleOpen(channelId)}
                                                aria-expanded={isOpen}
                                            >
                                                {isOpen
                                                    ? "Show less"
                                                    : `Show all ${formatViews(videos.length)}`}
                                            </button>
                                        )}
                                    </div>
                                </header>

                                {videos.length === 0 ? (
                                    <p className="sub__empty">This channel has no published videos in the latest feed.</p>
                                ) : (
                                    <VideoGrid videos={visible} layout="grid" showChannel={false} eagerCount={3} />
                                )}
                            </article>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Subscriptions;
