import mongoose,{isValidObjectId} from "mongoose";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Playlist } from "../models/playlist.model.js";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";

//create playlist controller
const createPLaylist=asyncHandler(async(req,res)=>{
    const {name,description}=req.body;
    if(!name){
        throw new ApiError(400,"Playlist name is required")
    }

    if(!description){
        throw new ApiError(400,"Playlist description is required")
    }

    if(!isValidObjectId(req.user._id)){
        throw new ApiError(400,"Invalid User Id")
    }

    const user=await User.findById(req.user._id);
    if(!user){
        throw new ApiError(404,"User not found")
    }

    const playlist=await Playlist.create({
        name,
        description,
        owner:req.user._id
    })
    return res
    .status(201)
    .json(
        new ApiResponse(
            201,
            playlist,
            "Playlist created successfully"
        )
    )
})

//get all playlists of a user
const getuserPlaylists=asyncHandler(async(req,res)=>{
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

    const playlists=await Playlist.find({owner:userId}).sort({createdAt:-1});

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            playlists,
            "User playlists fetched successfully"
        )
    )
})

//add video to playlist
const addVideoToPlaylist=asyncHandler(async(req,res)=>{
    const {playlistId,videoId}=req.params;
    if(!playlistId){
        throw new ApiError(400,"Playlist Id is required")
    }

    if(!videoId){
        throw new ApiError(400,"Video Id is required")
    }

    if(!isValidObjectId(playlistId)){
        throw new ApiError(400,"Invalid Playlist Id")
    }

    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid Video Id")
    }

    const playlist = await Playlist.findOne({
    _id: playlistId,
    owner: req.user._id
    });

    if(!playlist){
        throw new ApiError(404,"Playlist not found")
    }

    const video=await Video.findById(videoId);
    if(!video){
        throw new ApiError(404,"Video not found")
    }

    //check if video already exists in playlist
    if(playlist.videos.includes(videoId)){
        throw new ApiError(400,"Video already exists in playlist")
    }
    
    playlist.videos.push(videoId);
    await playlist.save();

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            playlist,
            "Video added to playlist successfully"
        )
    )
})

//remove video from playlist
const removeVideoFromPlaylist=asyncHandler(async(req,res)=>{
    const {playlistId,videoId}=req.params;
    if(!playlistId){
        throw new ApiError(400,"Playlist Id is required")
    }

    if(!videoId){
        throw new ApiError(400,"Video Id is required")
    }

    if(!isValidObjectId(playlistId)){
        throw new ApiError(400,"Invalid Playlist Id")
    }

    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid Video Id")
    }

    const playlist = await Playlist.findOne({
    _id: playlistId,
    owner: req.user._id
    });

    if(!playlist){
        throw new ApiError(404,"Playlist not found")
    }

    const video=await Video.findById(videoId);
    if(!video){
        throw new ApiError(404,"Video not found")
    }

    //check if video exists in playlist
    if(!playlist.videos.includes(videoId)){
        throw new ApiError(400,"Video does not exist in playlist")
    }
    
    playlist.videos.pull(videoId);
    await playlist.save();

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            playlist,
            "Video removed from playlist successfully"
        )
    )
})

//To delete a playlist
const deletePlaylist=asyncHandler(async(req,res)=>{
    const {playlistId}=req.params;
    if(!playlistId){
        throw new ApiError(400,"Playlist Id is required")
    }

    if(!isValidObjectId(playlistId)){
        throw new ApiError(400,"Invalid Playlist Id")
    }

    const playlist = await Playlist.findByIdAndDelete({
    _id: playlistId,
    owner: req.user._id
    });

    if(!playlist){
        throw new ApiError(404,"Playlist not found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {},
            "Playlist deleted successfully"
        )
    )
})

//To update the playlist
const updatePlaylist=asyncHandler(async(req,res)=>{
    const {playlistId}=req.params;
    const {name,description}=req.body;
    if(!playlistId){
        throw new ApiError(400,"Playlist Id is required")
    }

    if(!isValidObjectId(playlistId)){
        throw new ApiError(400,"Invalid Playlist Id")
    }

    const playlist = await Playlist.findOneAndUpdate(
        {
            _id: playlistId,
            owner: req.user._id
        },
        {
            $set:{
                name:name,
                description:description
            }
        },
        {
            new:true
        }
    );

    if(!playlist){
        throw new ApiError(404,"Playlist not found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            playlist,
            "Playlist updated successfully"
        )
    )
})
export{createPLaylist,
        getuserPlaylists,
        addVideoToPlaylist,
        removeVideoFromPlaylist,
        deletePlaylist,
        updatePlaylist
    }