import {isValidObjectId} from "mongoose";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import { Subscription } from "../models/subscription.model.js";
import {User} from "../models/user.model.js";

const toggleSubscription=asyncHandler(async(req,res)=>{
    const {channelId}=req.params;
    if(!channelId){
        throw new ApiError(400,"Channel Id is required")
    }
    if(!isValidObjectId(channelId)){
        throw new ApiError(400,"Invalid Channel Id")
    }
    const channel=await User.findById(channelId);
    if(!channel){
        throw new ApiError(404,"Channel not found")
    }
    const existingSubscription=await Subscription.findOne({
        subscriber:req.user._id,
        channel:channelId
    })
    if(existingSubscription){
        await Subscription.findByIdAndDelete(existingSubscription._id)
        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "Unsubscribed successfully"
            )
        )
    }
    const subscription=await Subscription.create({
        subscriber:req.user._id,
        channel:channelId
    })
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            subscription,
            "Subscribed successfully"
        )
    )
})

// controller to return subscriber list of a channel
const getChannelSubscribers=asyncHandler(async(req,res)=>{
    const {channelId}=req.params;
    if(!channelId){
        throw new ApiError(400,"Channel Id is required")
    }

    if(!isValidObjectId(channelId)){
        throw new ApiError(400,"Invalid Channel Id")
    }

    const channel=await User.findById(channelId);
    if(!channel){
        throw new ApiError(404,"Channel not found")
    }

    if(!isValidObjectId(channelId)){
        throw new ApiError(400,"Invalid Channel Id")
    }

    const subscribersList=await Subscription.find({
        channel:channelId
    }).populate("subscriber","username fullName avatar")

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            subscribersList,
            "Subscribers list fetched successfully"
        )
    )
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    if (!subscriberId) {
        throw new ApiError(400, "Subscriber Id is required")
    }

    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid Subscriber Id")
    }

    const subscriber = await User.findById(subscriberId)
    if (!subscriber) {
        throw new ApiError(404, "Subscriber not found")
    }

    const subscribedChannels = await Subscription.find({
        subscriber: subscriberId
    }).populate("channel", "username fullName avatar coverImage")

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                subscribedChannels,
                "Subscribed channels list fetched successfully"
            )
        )
})
export {toggleSubscription,getChannelSubscribers,getSubscribedChannels}