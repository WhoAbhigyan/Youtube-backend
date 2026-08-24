import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import Video from "../models/video.model.js"


const getVideoComments = asyncHandler(async (req, res) => {
    //get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    if (!videoId) {
    throw new ApiError(400, "Video ID is required")
    }

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid video ID")
    }

    const comments = await Comment.aggregatePaginate(
    Comment.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            fullName: 1,
                            username: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                owner: {
                    $first: "$owner"
                }
            }
        }
    ]),
    {
        page: Number(page),
        limit: Number(limit)
    }
)
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                comments,
                "Comments fetched successfully"
            )
        )
})

const addComment = asyncHandler(async (req, res) => {
    //add a comment to a video
    const {videoId}=req.params
    const {content}=req.body
    
    if(!content?.trim()){
        throw new ApiError(400,"Comment content is required")
    }

    if(!videoId){
        throw new ApiError(400,"Video ID is required")
    }

    //check wheter videoID is valid mongoDB object or not
    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400,"Invalid video ID")
    }
    //check if video exists
    const video=await Video.findById(videoId)

    if(!video){
        throw new ApiError(404,"Video does not exist")
    }
    const comment=await Comment.create({
        content,
        video:videoId,
        owner:req.user._id
    })

    return res
        .status(200)
        .json(
            new ApiResponse( 
                200,
                comment,
                "Comment added successfully")
        )
})

const updateComment = asyncHandler(async (req, res) => {
    //update a comment
    const{commentId}=req.params
    const{content}=req.body

    if(!content.trim()){
        throw new ApiError(400,"Comment content is required")
    }

    if(!commentId){
        throw new ApiError(400,"Comment ID is required")
    }

    if(!mongoose.Types.ObjectId.isValid(commentId)){
        throw new ApiError(400,"Inavlid commnet ID")
    }

    const updatedComment= await Comment.findOneAndUpdate(req.user._id,
        {
            _id:commentId,
            owner:req.user._id
        },
        {
            $set:{
                content:content
            }
        },
        {
            new:true
        }
    )

    if(!updateComment){
        throw new ApiError(
            404,
            "Comment not found or you are not the owner"
        )
    }
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                updatedComment,
                "Comment updated successfully"
            )
        )
})

const deleteComment = asyncHandler(async (req, res) => {
    //delete a comment
    const{commentId}=req.params

    if(!commentId){
        throw new ApiError(
            400,
            "Comment Id is required"
        )
    }

    if(!mongoose.Types.ObjectId.isValid(commentId)){
        throw new ApiError(
            400,
            "Invalid commnet Id"
        )
    }

    const deleteComment=await Comment.findOneAndDelete({
        id:commentId,
        owner:req.user._id
    })

    if(!deleteComment){
        throw new ApiError(
            404,
            "Comment not found or you are not the owner"
        )
    }
    
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                deleteComment,
                "Comment deleted successfully"
            )
        )
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
    }