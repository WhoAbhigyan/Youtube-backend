import cleanupTempFiles from "../utils/cleanupTempFiles.js";

const cleanupTempFilesMiddleware = (req, res, next) => {
    let cleaned = false;

    const cleanup = async () => {
        if (cleaned) return;

        cleaned = true;

        try {
            await cleanupTempFiles(req);
        } catch (error) {
            console.error("Temp file cleanup failed:", error);
        }
    };

    res.once("finish", cleanup);
    res.once("close", cleanup);

    next();
};

export default cleanupTempFilesMiddleware;