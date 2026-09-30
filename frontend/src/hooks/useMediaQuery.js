import { useEffect, useState } from "react";

/** Tracks a media query, e.g. useMediaQuery("(max-width: 1279px)") */
const useMediaQuery = (query) => {
    const [matches, setMatches] = useState(() =>
        typeof window === "undefined" ? false : window.matchMedia(query).matches
    );

    useEffect(() => {
        const media = window.matchMedia(query);
        const handler = (event) => setMatches(event.matches);

        setMatches(media.matches);
        media.addEventListener("change", handler);
        return () => media.removeEventListener("change", handler);
    }, [query]);

    return matches;
};

/** Layout switches from an inline sidebar to an overlay drawer below this width. */
export const useIsMobile = () => useMediaQuery("(max-width: 1279px)");

export default useMediaQuery;
