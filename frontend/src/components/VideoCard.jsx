import { useNavigate } from "react-router-dom";

function VideoCard({ video }) {
    const navigate = useNavigate();

    const openVideo = () => {
        navigate(`/watch/${video._id}`);
    };

    return (
        <article
            className="video-card"
            onClick={openVideo}
        >

            <div className="thumbnail-container">

                <img
                    src={video.thumbnail?.url}
                    alt={video.title}
                    className="video-thumbnail"
                />

                <span className="video-duration">
                    {Math.floor(video.duration / 60)}:
                    {Math.floor(video.duration % 60)
                        .toString()
                        .padStart(2, "0")}
                </span>

            </div>

            <div className="video-card-info">

                <img
                    src={video.owner?.avatar?.url}
                    alt={video.owner?.username}
                    className="channel-avatar"
                />

                <div className="video-details">

                    <h3 className="video-title">
                        {video.title}
                    </h3>

                    <p className="channel-name">
                        {video.owner?.fullName}
                    </p>

                    <p className="video-meta">
                        {video.views} views •{" "}
                        {new Date(video.createdAt).toLocaleDateString()}
                    </p>

                </div>

            </div>

        </article>
    );
}

export default VideoCard;