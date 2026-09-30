import { Link } from "react-router-dom";
import Avatar from "./Avatar";
import { cx, formatDate, formatDuration, formatViews } from "../utils/format";
import "./VideoCard.css";

const Thumb = ({ video, eager = false }) => (
    <div className="vcard__thumb">
        {video.thumbnail?.url ? (
            <img
                className="vcard__img"
                src={video.thumbnail.url}
                alt=""
                loading={eager ? "eager" : "lazy"}
                decoding="async"
            />
        ) : (
            <span className="vcard__thumb-fallback">No thumbnail</span>
        )}

        {video.duration ? (
            <span className="vcard__duration">{formatDuration(video.duration)}</span>
        ) : null}
    </div>
);

const ownerName = (video) => video.owner?.fullName || video.owner?.username || "Unknown channel";

/**
 * variant:
 *  "grid"    – home / channel / search results
 *  "compact" – watch page recommendations
 *  "row"     – playlist contents, dashboard lists, history
 */
const VideoCard = ({ video, variant = "grid", eager = false, showChannel = true, actions = null }) => {
    const watchHref = `/watch/${video._id}`;
    const channelHref = video.owner?.username ? `/channel/${video.owner.username}` : null;

    if (variant === "compact") {
        return (
            <article className="vcard vcard--compact">
                <Link to={watchHref} className="vcard__compact-thumb" tabIndex={-1} aria-hidden="true">
                    <Thumb video={video} eager={eager} />
                </Link>
                <div className="vcard__compact-body">
                    <Link to={watchHref} className="vcard__compact-title clamp-2">
                        {video.title}
                    </Link>
                    <p className="vcard__compact-channel truncate">{ownerName(video)}</p>
                    <p className="vcard__compact-meta">
                        {formatViews(video.views)} views · {formatDate(video.createdAt)}
                    </p>
                </div>
            </article>
        );
    }

    if (variant === "row") {
        return (
            <article className="vcard vcard--row">
                <Link to={watchHref} className="vcard__row-thumb" tabIndex={-1} aria-hidden="true">
                    <Thumb video={video} />
                </Link>

                <div className="vcard__row-body">
                    <Link to={watchHref} className="vcard__row-title clamp-2">
                        {video.title}
                    </Link>
                    <p className="vcard__row-meta">
                        {formatViews(video.views)} views · {formatDate(video.createdAt)}
                    </p>
                </div>

                {actions && <div className="vcard__row-actions">{actions}</div>}
            </article>
        );
    }

    return (
        <article className={cx("vcard", "vcard--grid")}>
            <Link to={watchHref} className="vcard__link" tabIndex={-1} aria-hidden="true">
                <Thumb video={video} eager={eager} />
            </Link>

            <div className="vcard__body">
                {showChannel && video.owner && (
                    <Avatar user={video.owner} size={36} to={channelHref} className="vcard__avatar" />
                )}

                <div className="vcard__content">
                    <Link to={watchHref} className="vcard__title clamp-2" title={video.title}>
                        {video.title}
                    </Link>

                    {showChannel && channelHref ? (
                        <Link to={channelHref} className="vcard__channel truncate">
                            {ownerName(video)}
                        </Link>
                    ) : (
                        showChannel && <span className="vcard__channel truncate">{ownerName(video)}</span>
                    )}

                    <p className="vcard__meta">
                        {formatViews(video.views)} views
                        <span aria-hidden="true"> · </span>
                        {formatDate(video.createdAt)}
                    </p>
                </div>
            </div>
        </article>
    );
};

export default VideoCard;
