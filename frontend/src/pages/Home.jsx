import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import VideoGrid from "../components/VideoGrid";
import { SkeletonGrid } from "../components/Skeletons";
import { EmptyState, ErrorState, SearchEmptyState } from "../components/States";
import { FilmIcon, FireIcon, SearchIcon } from "../components/Icons";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { videoApi } from "../services/endpoints";
import { getErrorMessage } from "../services/api";
import { pluralize } from "../utils/format";
import "./Home.css";

const PAGE_SIZE = 12;

/**
 * The backend has no category field, so the chips are real server-side searches
 * (GET /video/feed?search=…) and "All" clears the filter.
 */
const CATEGORIES = [
    { label: "All", term: "" },
    { label: "Music", term: "music" },
    { label: "Gaming", term: "gaming" },
    { label: "Programming", term: "programming" },
    { label: "Football", term: "football" },
    { label: "Cricket", term: "cricket" },
    { label: "Movies", term: "movies" }
];

const Home = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const query = (searchParams.get("q") ?? "").trim();

    const [videos, setVideos] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalVideos, setTotalVideos] = useState(0);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState("");

    useDocumentTitle(query ? `Search: ${query}` : "Home");

    const activeCategory = useMemo(
        () => CATEGORIES.find((item) => item.term && item.term === query.toLowerCase())?.label,
        [query]
    );

    const fetchFeed = useCallback(
        async ({ targetPage, append }) => {
            const data = await videoApi.feed({ page: targetPage, limit: PAGE_SIZE, search: query || undefined });
            setVideos((current) => (append ? [...current, ...data.videos] : data.videos));
            setTotalPages(data.totalPages);
            setTotalVideos(data.totalVideos);
        },
        [query]
    );

    useEffect(() => {
        let active = true;

        setLoading(true);
        setError("");
        setPage(1);

        fetchFeed({ targetPage: 1, append: false })
            .catch((err) => {
                console.error("Failed to load the feed:", err);
                if (active) setError(getErrorMessage(err, "Unable to load videos"));
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
        };
    }, [fetchFeed]);

    const loadMore = async () => {
        if (loadingMore || page >= totalPages) return;

        const nextPage = page + 1;
        setLoadingMore(true);
        try {
            await fetchFeed({ targetPage: nextPage, append: true });
            setPage(nextPage);
        } catch (err) {
            console.error("Failed to load more videos:", err);
            setError(getErrorMessage(err, "Unable to load more videos"));
        } finally {
            setLoadingMore(false);
        }
    };

    const selectCategory = (term) => {
        setSearchParams(term ? { q: term } : {});
    };

    const clearSearch = () => setSearchParams({});

    return (
        <div className="home">
            <h1 className="sr-only">{query ? `Search results for ${query}` : "Home videos"}</h1>

            <div className="home__chips" role="group" aria-label="Categories">
                {CATEGORIES.map((category) => {
                    const isActive = category.term
                        ? query.toLowerCase() === category.term
                        : !activeCategory && (category.term === "" ? !query : false);

                    return (
                        <button
                            key={category.label}
                            type="button"
                            className="chip"
                            aria-pressed={isActive}
                            onClick={() => selectCategory(category.term)}
                        >
                            {category.label}
                        </button>
                    );
                })}
            </div>

            {query && (
                <div className="home__results-head">
                    <p className="home__results-title">
                        <SearchIcon size={18} />
                        {loading ? "Searching…" : `${pluralize(totalVideos, "result")} for “${query}”`}
                    </p>
                    <button type="button" className="btn btn--ghost btn--sm" onClick={clearSearch}>
                        Clear
                    </button>
                </div>
            )}

            {loading ? (
                <SkeletonGrid count={PAGE_SIZE} />
            ) : error && videos.length === 0 ? (
                <ErrorState title="Unable to load videos" message={error} onRetry={() => fetchFeed({ targetPage: 1, append: false })} />
            ) : videos.length === 0 ? (
                query ? (
                    <SearchEmptyState query={query} onReset={clearSearch} />
                ) : (
                    <EmptyState
                        icon={FireIcon}
                        title="No videos published yet"
                        description="Once a video is published it shows up here for everyone. Upload the first one to get started."
                        action={
                            <Link to="/upload" className="btn btn--primary btn--sm">
                                Upload a video
                            </Link>
                        }
                    />
                )
            ) : (
                <>
                    <VideoGrid videos={videos} layout="grid" className="home__grid" />

                    {error && <p className="home__inline-error">{error}</p>}

                    <div className="home__footer">
                        {page < totalPages ? (
                            <button
                                type="button"
                                className="btn btn--outline"
                                onClick={loadMore}
                                disabled={loadingMore}
                            >
                                {loadingMore && <span className="spinner spinner--sm" />}
                                {loadingMore ? "Loading…" : "Load more videos"}
                            </button>
                        ) : (
                            <p className="home__end">
                                <FilmIcon size={16} />
                                You have reached the end — {pluralize(totalVideos, "video")}
                            </p>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default Home;
