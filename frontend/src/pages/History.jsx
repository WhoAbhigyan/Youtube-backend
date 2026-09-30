import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import VideoGrid from "../components/VideoGrid";
import { EmptyState, ErrorState } from "../components/States";
import { SkeletonRow } from "../components/Skeletons";
import { HistoryIcon } from "../components/Icons";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { authApi } from "../services/endpoints";
import { getErrorMessage } from "../services/api";
import { pluralize } from "../utils/format";
import "./History.css";

const History = () => {
    useDocumentTitle("History");

    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const load = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const data = await authApi.watchHistory();
            setVideos(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Failed to load watch history:", err);
            setError(getErrorMessage(err, "Could not load your watch history"));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    return (
        <div className="history">
            <PageHeader
                eyebrow="Your activity"
                title="Watch history"
                description={
                    loading ? "Loading your history…" : pluralize(videos.length, "watched video")
                }
            />

            {loading ? (
                <div className="history__list">
                    <SkeletonRow lines={2} />
                    <SkeletonRow lines={2} />
                    <SkeletonRow lines={2} />
                </div>
            ) : error && videos.length === 0 ? (
                <ErrorState title="Could not load your history" message={error} onRetry={load} />
            ) : videos.length === 0 ? (
                <EmptyState
                    icon={HistoryIcon}
                    title="Nothing watched yet"
                    description="Watch history isn't recorded yet — the backend only reads this list, so it stays empty until history tracking is added."
                    action={
                        <Link to="/" className="btn btn--primary btn--sm">
                            Start watching
                        </Link>
                    }
                />
            ) : (
                <VideoGrid videos={videos} layout="list" />
            )}
        </div>
    );
};

export default History;
