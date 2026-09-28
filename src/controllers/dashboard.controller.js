import mongoose,{isValidObjectId} from "mongoose";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import {Subscription} from "../models/subscription.model.js";
import {User} from "../models/user.model.js";
import {Like} from "../models/like.model.js";
import {Video} from "../models/video.model.js";

// Get the channel stats like total video views, total subscribers, total videos, total likes etc.
const getChannelStats=asyncHandler(async(req,res)=>{
    const userId=req.user._id;
    
    if(!isValidObjectId(userId)){
        throw new ApiError(400,"Invalid User Id")
    }

    const videos=await Video.find(
        {owner:userId}
    );

    const totalVideos=videos.length;
    
    const totalViews=videos.reduce((acc,video)=>{
        return acc+video.views;
    },0);

    const totalSubscribers=await Subscription.countDocuments({
        channel:userId
    });

    const totalLikes=await Like.countDocuments({
        video:{
            $in:videos.map(video=>video._id)
        }
    });
    
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {
                totalVideos,
                totalViews,
                totalSubscribers,
                totalLikes
            },
            "Channel stats fetched successfully"
        )
    )
})

//Get all the videos uploaded by the channel
const getChannelVideos = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    if(!isValidObjectId(userId)){
        throw new ApiError(400,"Invalid User Id")
    }
    
    const videos = await Video.find(
        { owner: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
    
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            { videos },
            "Channel videos fetched successfully"
        )
    )
})
export {getChannelStats,getChannelVideos}