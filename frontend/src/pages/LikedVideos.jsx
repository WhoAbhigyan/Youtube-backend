import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import VideoGrid from "../components/VideoGrid";
import { EmptyState, ErrorState } from "../components/States";
import { SkeletonGrid } from "../components/Skeletons";
import { LikeVideosIcon } from "../components/Icons";
import useDocumentTitle from "../hooks/useDocumentTitle";
import useLikedVideos from "../hooks/useLikedVideos";
import { pluralize } from "../utils/format";
import "./LikedVideos.css";

const LikedVideos = () => {
    useDocumentTitle("Liked videos");

    const { videos, loading, error } = useLikedVideos();

    return (
        <div className="liked">
            <PageHeader
                eyebrow="Your library"
                title="Liked videos"
                description={
                    loading
                        ? "Loading the videos you liked…"
                        : videos.length > 0
                          ? pluralize(videos.length, "video")
                          : "Videos you like are collected here."
                }
            />

            {loading ? (
                <SkeletonGrid count={4} />
            ) : error && videos.length === 0 ? (
                <ErrorState title="Could not load liked videos" message={error} />
            ) : videos.length === 0 ? (
                <EmptyState
                    icon={LikeVideosIcon}
                    title="No liked videos yet"
                    description="Tap the like button while watching and the video will appear here."
                    action={
                        <Link to="/" className="btn btn--primary btn--sm">
                            Browse videos
                        </Link>
                    }
                />
            ) : (
                <VideoGrid videos={videos} layout="grid" />
            )}
        </div>
    );
};

export default LikedVideos;
