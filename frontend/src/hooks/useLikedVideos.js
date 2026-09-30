import { useCallback, useEffect, useState } from "react";
import { likeApi } from "../services/endpoints";
import { getErrorMessage } from "../services/api";

/**
 * The backend exposes the liked videos of the current user, so "is this video
 * liked" is answered from real data. The result is cached at module level so
 * the watch page, the save-to-playlist flow and the liked page share one request.
 */
let cache = null;
let inFlight = null;

const fetchLikedVideos = () => {
    if (cache) return Promise.resolve(cache);
    if (!inFlight) {
        inFlight = likeApi
            .likedVideos()
            .then((likes) => {
                const videos = (likes || [])
                    .map((like) => like.video)
                    .filter((video) => video && video._id);
                cache = { ids: videos.map((video) => video._id), videos };
                return cache;
            })
            .finally(() => {
                inFlight = null;
            });
    }
    return inFlight;
};

export const invalidateLikedVideos = () => {
    cache = null;
};

const useLikedVideos = () => {
    const [videos, setVideos] = useState(cache ? cache.videos : []);
    const [ids, setIds] = useState(() => (cache ? new Set(cache.ids) : new Set()));
    const [loading, setLoading] = useState(!cache);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;

        fetchLikedVideos()
            .then((result) => {
                if (!active) return;
                setVideos(result.videos);
                setIds(new Set(result.ids));
            })
            .catch((err) => {
                console.error("Failed to load liked videos:", err);
                if (active) setError(getErrorMessage(err, "Could not load liked videos"));
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
        };
    }, []);

    const isLiked = useCallback((videoId) => ids.has(videoId), [ids]);

    return { videos, ids, isLiked, loading, error };
};

export default useLikedVideos;
