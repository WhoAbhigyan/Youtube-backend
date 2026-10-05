 import fs from "fs/promises";

const cleanupTempFiles = async (req) => {
    const files = [];

    if (req.file) {
        files.push(req.file);
    }

    if (req.files) {
        if (Array.isArray(req.files)) {
            files.push(...req.files);
        } else {
            Object.values(req.files).forEach((fieldFiles) => {
                if (Array.isArray(fieldFiles)) {
                    files.push(...fieldFiles);
                }
            });
        }
    }

    await Promise.allSettled(
        files.map(async (file) => {
            if (!file?.path) return;

            try {
                await fs.unlink(file.path);
            } catch (error) {
                // File may already have been deleted by Cloudinary utility.
                if (error.code !== "ENOENT") {
                    console.error(
                        `Failed to delete temp file: ${file.path}`,
                        error
                    );
                }
            }
        })
    );
};

export default cleanupTempFiles;