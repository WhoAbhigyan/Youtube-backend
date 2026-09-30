import VideoCard from "./VideoCard";
import { cx } from "../utils/format";
import "./VideoGrid.css";

/**
 * layout: "grid" – responsive card grid (home, channel, search)
 *         "list" – single column of horizontal rows (history, liked, playlists)
 */
const VideoGrid = ({ videos, layout = "grid", className, eagerCount = 4, showChannel = true }) => (
    <div className={cx("vgrid", `vgrid--${layout}`, className)}>
        {videos.map((video, index) => (
            <VideoCard
                key={video._id}
                video={video}
                variant={layout === "grid" ? "grid" : "row"}
                showChannel={showChannel}
                eager={layout === "grid" && index < eagerCount}
            />
        ))}
    </div>
);

export default VideoGrid;
