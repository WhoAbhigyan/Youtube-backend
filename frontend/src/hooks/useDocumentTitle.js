import { useEffect } from "react";

const useDocumentTitle = (title) => {
    useEffect(() => {
        const previous = document.title;
        document.title = title ? `${title} · VideoTube` : "VideoTube";
        return () => {
            document.title = previous;
        };
    }, [title]);
};

export default useDocumentTitle;
