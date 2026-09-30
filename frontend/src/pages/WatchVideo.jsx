import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

function WatchVideo() {
    const { videoId } = useParams();
    const navigate = useNavigate();

    const [video, setVideo] = useState(null);
    const [recommendedVideos, setRecommendedVideos] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [liked, setLiked] = useState(false);
    const [subscribed, setSubscribed] = useState(false);

    const [comment, setComment] = useState("");
    const [comments, setComments] = useState([]);

    const getVideo = async () => {
        try {
            setLoading(true);

            const response = await api.get(`/video/${videoId}`);

            setVideo(response.data.message);
        } catch (error) {
            console.log("GET VIDEO ERROR:", error);

            setError(
                error.response?.data?.message || "Failed to load video"
            );
        } finally {
            setLoading(false);
        }
    };

    const getRecommendedVideos = async () => {
        try {
            const response = await api.get("/video/allVideos");

            const videos = response.data.message?.videos || [];

            setRecommendedVideos(
                videos.filter((item) => item._id !== videoId)
            );
        } catch (error) {
            console.log("RECOMMENDED VIDEOS ERROR:", error);
        }
    };

    useEffect(() => {
        getVideo();
        getRecommendedVideos();
    }, [videoId]);

    const handleLike = () => {
        setLiked(!liked);
    };

    const handleSubscribe = () => {
        setSubscribed(!subscribed);
    };

    const handleShare = async () => {
        try {
            if (navigator.share) {
                await navigator.share({
                    title: video?.title,
                    url: window.location.href
                });
            } else {
                await navigator.clipboard.writeText(window.location.href);
                alert("Video link copied!");
            }
        } catch (error) {
            console.log("Share cancelled");
        }
    };

    const handleComment = (e) => {
        e.preventDefault();

        if (!comment.trim()) {
            return;
        }

        const newComment = {
            id: Date.now(),
            text: comment
        };

        setComments([newComment, ...comments]);
        setComment("");
    };

    if (loading) {
        return (
            <main className="watch-page">
                <p className="status-message">Loading video...</p>
            </main>
        );
    }

    if (error) {
        return (
            <main className="watch-page">
                <p className="status-message">{error}</p>
            </main>
        );
    }

    if (!video) {
        return (
            <main className="watch-page">
                <p className="status-message">Video not found.</p>
            </main>
        );
    }

    return (
        <main className="watch-page">

            <div className="watch-layout">

                {/* LEFT SIDE */}

                <div className="watch-main">

                    <div className="video-player-wrapper">
                        <video
                            className="video-player"
                            controls
                            poster={video.thumbnail?.url}
                        >
                            <source
                                src={video.videoFile?.url}
                                type="video/mp4"
                            />

                            Your browser does not support video playback.
                        </video>
                    </div>

                    <h1 className="watch-title">
                        {video.title}
                    </h1>

                    <div className="video-meta">
                        <span>
                            {video.views} views
                        </span>

                        <span>•</span>

                        <span>
                            {new Date(
                                video.createdAt
                            ).toLocaleDateString()}
                        </span>
                    </div>

                    {/* ACTIONS */}

                    <div className="video-actions">

                        <button
                            className={
                                liked
                                    ? "action-btn active"
                                    : "action-btn"
                            }
                            onClick={handleLike}
                        >
                            👍 {liked ? "Liked" : "Like"}
                        </button>

                        <button className="action-btn">
                            👎 Dislike
                        </button>

                        <button
                            className="action-btn"
                            onClick={handleShare}
                        >
                            ↗ Share
                        </button>

                        <button className="action-btn">
                            💾 Save
                        </button>

                    </div>

                    {/* CHANNEL */}

                    <div className="channel-section">

                        <div className="channel-info">

                            <img
                                src={video.owner?.avatar?.url}
                                alt={video.owner?.username}
                                className="watch-channel-avatar"
                            />

                            <div>
                                <h3>
                                    {video.owner?.fullName}
                                </h3>

                                <p>
                                    @{video.owner?.username}
                                </p>
                            </div>

                        </div>
                        <button
                            className={
                                subscribed
                                    ? "subscribe-btn subscribed"
                                    : "subscribe-btn"
                            }
                            onClick={handleSubscribe}
                        >
                            {subscribed ? "Subscribed" : "Subscribe"}
                        </button>
                    </div>

                    {/* DESCRIPTION */}

                    <div className="description-box">

                        <div className="description-header">
                            {video.views} views
                        </div>

                        <p>
                            {video.description}
                        </p>

                    </div>

                    {/* COMMENTS */}

                    <section className="comments-section">

                        <h2>
                            {comments.length} Comments
                        </h2>

                        <form
                            className="comment-form"
                            onSubmit={handleComment}
                        >
                            <input
                                type="text"
                                placeholder="Add a comment..."
                                value={comment}
                                onChange={(e) =>
                                    setComment(e.target.value)
                                }
                            />

                            <button type="submit">
                                Comment
                            </button>
                        </form>

                        <div className="comments-list">

                            {comments.length === 0 ? (
                                <p className="no-comments">
                                    No comments yet. Be the first to
                                    comment!
                                </p>
                            ) : (
                                comments.map((item) => (
                                    <div
                                        className="comment"
                                        key={item.id}
                                    >
                                        <div className="comment-avatar">
                                            U
                                        </div>

                                        <div className="comment-content">
                                            <strong>You</strong>

                                            <p>
                                                {item.text}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}

                        </div>

                    </section>

                </div>

                {/* RIGHT SIDE */}

                <aside className="recommendations">

                    <div className="recommendation-chips">

                        <button className="recommendation-chip active">
                            All
                        </button>

                        <button className="recommendation-chip">
                            Related
                        </button>

                        <button className="recommendation-chip">
                            More
                        </button>

                    </div>

                    {recommendedVideos.length === 0 ? (
                        <p className="no-recommendations">
                            No more videos yet.
                        </p>
                    ) : (
                        recommendedVideos.map((item) => (
                            <article
                                className="recommended-video"
                                key={item._id}
                                onClick={() =>
                                    navigate(`/watch/${item._id}`)
                                }
                            >
                                <div className="recommended-thumbnail-wrapper">

                                    <img
                                        src={item.thumbnail?.url}
                                        alt={item.title}
                                        className="recommended-thumbnail"
                                    />

                                    <span className="recommended-duration">
                                        {Math.floor(
                                            item.duration / 60
                                        )}
                                        :
                                        {Math.floor(
                                            item.duration % 60
                                        )
                                            .toString()
                                            .padStart(2, "0")}
                                    </span>

                                </div>

                                <div className="recommended-info">

                                    <h3>
                                        {item.title}
                                    </h3>

                                    <p>
                                        {item.owner?.fullName}
                                    </p>

                                    <p>
                                        {item.views} views
                                    </p>

                                </div>

                            </article>
                        ))
                    )}

                </aside>

            </div>

        </main>
    );
}

export default WatchVideo;