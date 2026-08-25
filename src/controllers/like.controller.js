import mongoose from "mongoose"
import { Like } from "../models/like.model.js"
import { Tweet } from "../models/tweet.model.js"
import { Video } from "../models/video.model.js"
import { Comment } from "../models/comment.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //toggle like on video

    if(!videoId){
        throw new ApiError(400,"Video Id is reuquired")
    }

    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400,"Video Id not found")
    }

    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(404,"Video not found")
    }
    const existingLike=await Like.findOne({
        video:videoId,
        likedBy:req.user._id
    })

    if(existingLike){
        await Like.findByIdAndDelete(existingLike._id)
        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "Video unliked successfully"
            )
        )
    }

    const like=await Like.create({
        video:videoId,
        likedBy:req.user._id
    })

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            like,
            "Video liked successfully"
        )
    )
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //toggle like on comment

    if(!commentId){
        throw new ApiError(400,"Comment Id is required")
    }

    if(!mongoose.Types.ObjectId.isValid(commentId)){
        throw new ApiError(400,"Comment Id not found")
    }

    const comment=await Comment.findById(commentId)

    if(!comment){
        throw new ApiError(404,"Comment not found")
    }
    const existingLike=await Like.findOne({
        comment:commentId,
        likedBy:req.user._id
    })

    if(existingLike){
        await Like.findByIdAndDelete(existingLike._id)
                return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "Comment unliked successfully"
            )
        )
    }

    const like=await Like.create({
        comment:commentId,
        likedBy:req.user._id
    })

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            like,
            "Comment liked successfully"
        )
    )
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //toggle like on tweet
    if(!tweetId){
        throw new ApiError(400,"Tweet Id is reuquired")
    }

    if(!mongoose.Types.ObjectId.isValid(tweetId)){
        throw new ApiError(400,"Tweet Id not found")
    }

    const tweet=await Tweet.findById(tweetId)

    if(!tweet){
        throw new ApiError(404,"Tweet does not exist")
    }
    const existingLike=await Like.findOne({
        tweet:tweetId,
        likedBy:req.user._id
    })

    if(existingLike){
        await Like.findByIdAndDelete(existingLike._id)
        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "Tweet unliked successfully"
            )
        )
    }

    const like=await Like.create({
        tweet:tweetId,
        likedBy:req.user._id
    })

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            like,
            "Tweet liked successfully"
        )
    )
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //get all liked videos

    const pipeline=[
        {
            $match:{
                likedBy:new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"video",
                foreignField:"_id",
                as:"video",
                pipeline:[
                    {
                    $lookup:{
                        from:"users",
                        localField:"owner",
                        foreignField:"_id",
                        as:"owner",
                        pipeline:[
                            {
                                $project:{
                                    fullName:1,
                                    username:1,
                                    avatar:1
                                }
                            }
                        ]
                    }
                },
                {
                    $addFields:{
                        owner:{
                            $first:"$owner"
                        }
                    }
                }
                ]
            }
        },
        {
            $addFields:{
                video:{
                    $first:"$video"
                }
            }
        }
    ]

    return res
        .status(200)
        .json(
            new ApiResponse(
            200,
            pipeline,
            "List of liked videos"
            )
    )
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}