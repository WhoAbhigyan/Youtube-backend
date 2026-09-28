import { v2 as cloudinary } from "cloudinary";
import fs from "fs";


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) {
            throw new Error("File path is required");
        }
        const response = await cloudinary.uploader.upload(
            localFilePath,
            {
                resource_type: "auto"
            }
        );
        console.log(
            "File uploaded successfully:",
            response.url
        );
        return response;

    } catch (error) {

        console.log(
            "Cloudinary upload error:",
            error
        );

        return null;

    } finally {
        // Delete temporary local file
        if (
            localFilePath &&
            fs.existsSync(localFilePath)
        ) {
            fs.unlinkSync(localFilePath);
        }
    }
};
const deleteFromCloudinary = async (
    publicId,
    resourceType = "image"
) => {

    try {

        if (!publicId) {
            return null;
        }

        const response =
            await cloudinary.uploader.destroy(
                publicId,
                {
                    resource_type: resourceType
                }
            );

        console.log(
            "Cloudinary delete response:",
            response
        );

        return response;

    } catch (error) {

        console.log(
            "Cloudinary delete error:",
            error
        );

        return null;
    }
};

export {
    uploadOnCloudinary,
    deleteFromCloudinary
};