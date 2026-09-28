import { isValidObjectId } from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";

import {
    uploadOnCloudinary,
    deleteFromCloudinary
} from "../utils/cloudinary.js";



const getAllVideos = asyncHandler(async (req, res) => {

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const sortBy = req.query.sortBy || "createdAt";
    const order = req.query.order || "desc";

    const userId = req.user._id;

    if (!userId) {
        throw new ApiError(400, "User Id is required");
    }

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid User Id");
    }

    const videos = await Video.find({
        owner: userId
    })
        .sort({
            [sortBy]: order === "desc" ? -1 : 1
        })
        .skip(skip)
        .limit(limit)
        .populate({
            path: "owner",
            select: "fullName username avatar"
        });

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { videos },
                "Videos fetched successfully"
            )
        );
});

const uploadVideo = asyncHandler(async (req, res) => {

    const { title, description } = req.body;

    if (!title?.trim()) {
        throw new ApiError(400, "Title is required");
    }

    if (!description?.trim()) {
        throw new ApiError(400, "Description is required");
    }

    // Get files uploaded by Multer
    const videoFile = req.files?.videoFile?.[0];
    const thumbnailFile = req.files?.thumbnail?.[0];

    if (!videoFile) {
        throw new ApiError(400, "Video file is required");
    }

    if (!thumbnailFile) {
        throw new ApiError(400, "Thumbnail file is required");
    }


    // Upload video to Cloudinary
    const uploadedVideo = await uploadOnCloudinary(
        videoFile.path
    );

    // Upload thumbnail to Cloudinary
    const uploadedThumbnail = await uploadOnCloudinary(
        thumbnailFile.path
    );


    if (!uploadedVideo) {
        throw new ApiError(
            500,
            "Error while uploading video"
        );
    }

    if (!uploadedThumbnail) {
        throw new ApiError(
            500,
            "Error while uploading thumbnail"
        );
    }


    // Create video document in MongoDB
    const video = await Video.create({

        videoFile: {
            url: uploadedVideo.url,
            public_id: uploadedVideo.public_id
        },

        thumbnail: {
            url: uploadedThumbnail.url,
            public_id: uploadedThumbnail.public_id
        },

        title,
        description,

        duration: uploadedVideo.duration,

        owner: req.user._id
    });


    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                video,
                "Video uploaded successfully"
            )
        );
});

const getVideoById = asyncHandler(async (req, res) => {

    const { videoId } = req.params;

    if (!videoId) {
        throw new ApiError(
            400,
            "Video Id is required"
        );
    }

    if (!isValidObjectId(videoId)) {
        throw new ApiError(
            400,
            "Invalid Video Id"
        );
    }


    const video = await Video.findById(videoId)
        .populate({
            path: "owner",
            select: "fullName username avatar"
        });


    if (!video) {
        throw new ApiError(
            404,
            "Video not found"
        );
    }


    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                video,
                "Video fetched successfully"
            )
        );
});


const updateVideo = asyncHandler(async (req, res) => {

    const { videoId } = req.params;

    const { title, description } = req.body;


    if (!videoId) {
        throw new ApiError(
            400,
            "Video Id is required"
        );
    }

    if (!isValidObjectId(videoId)) {
        throw new ApiError(
            400,
            "Invalid Video Id"
        );
    }


    // Find video AND check ownership
    const video = await Video.findOne({
        _id: videoId,
        owner: req.user._id
    });


    if (!video) {
        throw new ApiError(
            404,
            "Video not found or you are not the owner"
        );
    }


    // Update title
    if (title?.trim()) {
        video.title = title;
    }


    // Update description
    if (description?.trim()) {
        video.description = description;
    }


    // Check if new thumbnail was uploaded
    const thumbnailFile = req.files?.thumbnail?.[0];


    if (thumbnailFile) {

        // Delete old thumbnail from Cloudinary
        await deleteFromCloudinary(
            video.thumbnail.public_id,
            "image"
        );


        // Upload new thumbnail
        const uploadedThumbnail = await uploadOnCloudinary(
            thumbnailFile.path
        );


        if (!uploadedThumbnail) {
            throw new ApiError(
                500,
                "Error while uploading thumbnail"
            );
        }


        // Save new thumbnail details
        video.thumbnail = {
            url: uploadedThumbnail.url,
            public_id: uploadedThumbnail.public_id
        };
    }


    await video.save();


    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                video,
                "Video updated successfully"
            )
        );
});

const deleteVideo = asyncHandler(async (req, res) => {

    const { videoId } = req.params;


    if (!videoId) {
        throw new ApiError(
            400,
            "Video Id is required"
        );
    }

    if (!isValidObjectId(videoId)) {
        throw new ApiError(
            400,
            "Invalid Video Id"
        );
    }

    // Find video AND check ownership
    const video = await Video.findOne({
        _id: videoId,
        owner: req.user._id
    });

    if (!video) {
        throw new ApiError(
            404,
            "Video not found or you are not the owner"
        );
    }

    // Delete video from Cloudinary
    await deleteFromCloudinary(
        video.videoFile.public_id,
        "video"
    );

    // Delete thumbnail from Cloudinary
    await deleteFromCloudinary(
        video.thumbnail.public_id,
        "image"
    );

    // Delete video document from MongoDB
    await Video.findByIdAndDelete(videoId);


    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "Video deleted successfully"
            )
        );
});

const togglePublishStatus = asyncHandler(async (req, res) => {

    const { videoId } = req.params;

    if (!videoId) {
        throw new ApiError(400, "Video Id is required");
    }

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Video Id");
    }

    const video = await Video.findOne({
        _id: videoId,
        owner: req.user._id
    });

    if (!video) {
        throw new ApiError(
            404,
            "Video not found or you are not the owner"
        );
    }

    // Toggle publish status
    video.isPublished = !video.isPublished;

    await video.save();

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                video,
                `Video ${
                    video.isPublished
                        ? "published"
                        : "unpublished"
                } successfully`
            )
        );
});
export {
    getAllVideos,
    uploadVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
};