import mongoose,{isValidObjectId} from "mongoose";
import {Tweet} from "../models/tweet.model.js";
import {User} from "../models/user.model.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {asyncHandler} from "../utils/asyncHandler.js";

const createTweet=asyncHandler(async(req,res)=>{
    const {content}=req.body;

    if(!content){
        throw new ApiError(400,"Content is required")
    }

    const tweet=await Tweet.create({
        content,
        owner:req.user._id
    })

    return res
    .status(201)
    .json(
        new ApiResponse(
            201,
            tweet,
            "Tweet created successfully"
        )
    )
})
const getUserTweets=asyncHandler(async(req,res)=>{
    const {userId}=req.params;

    if(!userId){
        throw new ApiError(400,"User Id is required")
    }

    if(!isValidObjectId(userId)){
        throw new ApiError(400,"Invalid User Id")
    }

    const user=await User.findById(userId);

    if(!user){
        throw new ApiError(404,"User not found")
    }

    const tweets=await Tweet.find({owner:user._id}).sort({createdAt:-1});

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            tweets,
            "User tweets fetched successfully"
        )
    )
})

const updateTweet=asyncHandler(async(req,res)=>{
    const {tweetId}=req.params;
    const {content}=req.body;

    if(!tweetId){
        throw new ApiError(400,"Tweet Id is required")
    }

    if(!isValidObjectId(tweetId)){
        throw new ApiError(400,"Invalid Tweet Id")
    }

    if(!content){
        throw new ApiError(400,"Content is required")
    }

    const updatedTweet=await Tweet.findOneAndUpdate(
        {
            _id:tweetId,
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

    if(!updatedTweet){
        throw new ApiError(404,"Tweet not found or you are not the owner")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            updatedTweet,
            "Tweet updated successfully"
        )
    )
})

const deleteTweet=asyncHandler(async(req,res)=>{
    const {tweetId}=req.params;

    if(!tweetId){
        throw new ApiError(400,"Tweet Id is required")
    }

    if(!isValidObjectId(tweetId)){
        throw new ApiError(400,"Invalid Tweet Id")
    }

    const deletedTweet=await Tweet.findOneAndDelete({
        _id:tweetId,
        owner:req.user._id
    })

    if(!deletedTweet){
        throw new ApiError(404,"Tweet not found or you are not the owner")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            deletedTweet,
            "Tweet deleted successfully"
        )
    )
})
export{createTweet, getUserTweets, updateTweet, deleteTweet}