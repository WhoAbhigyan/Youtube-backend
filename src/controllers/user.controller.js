import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from '../utils/ApiError.js'
import {User} from '../models/user.model.js'
import {uploadOnCloudinary,deleteFromCloudinary} from '../utils/cloudinary.js'
import {ApiResponse} from '../utils/ApiResponse.js'
import jwt from "jsonwebtoken"


const generateAccessAndRefreshTokens=async(userId)=>{
    try{
        const user=await User.findById(userId)
        const accessToken= user.generateAccessToken()
        const refreshToken= user.generateRefreshToken()

        user.refreshToken=refreshToken
        await user.save({validateBeforeSave:false})//save is method of moongoose

        return {accessToken,refreshToken}

    }catch(error){
        throw new ApiError(500,"Something went wrong while generating refresh and access token")
    }
}

const registerUser=asyncHandler(async(req,res) => {
     //get user details from frontend
     //validate user details --not empty
     //check if user already exists: username,email
     //check for images,check for avatar
     //upload them to cloudinary
     //create user object-create entry in db
     //remove password and refresh token feed from response
     //check for user creation
     //return response

     const {username,fullName,email,password}=req.body
     console.log("email: ",email)

    //  if(fullName===""){
    //     throw new ApiError(400,"fullname is required")
    //  }
    if(
        [fullName,username,email,password].some((field)=>{
            return field?.trim()==="";
        })
    ){
        throw new ApiError(400,"All fields are required")
    }
    if(!email.includes("@") || email.endsWith("@") || email.startsWith("@")){
        throw new ApiError(400,"valid email is required")
    }
    const existedUser = await User.findOne({
        $or:[{username},{email}]
    })
    if(existedUser){
        //409 means Conflict
        throw new ApiError(409,"User with email or username already exists")
    }
    const avatarLocalPath=req.files?.avatar?.[0]?.path
    // const coverImageLocalPath=req.files?.coverImage?.[0]?.path

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
        coverImageLocalPath=req.files.coverImage[0].path;
    }

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required")
    }

    const avatar=await uploadOnCloudinary(avatarLocalPath)
    const coverImage=await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(400,"Avatar is required")
    }

    const user=await User.create({
        fullName,
        avatar:{
            url:avatar.url,
            public_id:avatar.public_id
        },
        coverImage:coverImage
            ?{
                url:coverImage.url,
                public_id:coverImage.public_id
            }:undefined,
        email,
        password,
        username:username.toLowerCase()
    })

    const createdUser=await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if(!createdUser){
        throw new ApiError(500,"Something went wrong while registreing the user")
    }

    return res.status(201).json(
        new ApiResponse(200,createdUser,"User registered Successfully")
    )
})

//Login User
const loginUser=asyncHandler(async(req,res)=>{
    //req body->data
    //check username or email
    //find the user
    //password check
    //acces and refresh token generate
    //send to cookies

    const {email,username,password}=req.body

    if(!username && ! email){
        throw new ApiError(400,"Username or email is required")
    }

    const user= await User.findOne({
        $or:[{username},{email}]
    })

    if(!user){
        throw new ApiError(404,"User does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401,"Invalid user credentials")
    }

    const {accessToken,refreshToken}=await generateAccessAndRefreshTokens(user._id)

    const loggedInUser=await User.findById(user._id).
    select("-password -refreshToken")

    const options={
        httpOnly:true,
        secure:true
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,
            //data from the ApiResponse
            {
                user:loggedInUser,accessToken,refreshToken
            },
            "User logged in Successfully"
        )
    )
})

//Logout User
const logoutUser=asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken:undefined
            }
        },
        {
            new:true
        }
    )

    const options={
        httpOnly:true,
        secure:true
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(
        new ApiResponse(200,{},"User logged Out")
    )
})

//Generate new accessToken while checking that the old refreshToken is same as the saved one in the database
const refreshAccessToken=asyncHandler(async(req,res)=>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401,"Unauthorized request")
    }

try{
    const decodedToken = await jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)

    const user = await User.findById(decodedToken?._id)

    if(!user){
        throw new ApiError(401,"Invalid refresh token")
    }

    if(incomingRefreshToken !== user?.refreshToken){
        throw new ApiError(401,"Refresh token is expried or used")
    }
    
    const options={
        httpOnly:true,
        secure:true
    }

    const {accessToken,newRefreshToken}=await generateAccessAndRefreshTokens(user._id)

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie ("refreshToken",newRefreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
                accessToken:accessToken,
                refreshToken:newRefreshToken
            },
            "Access token refreshed"
        )
    )
}catch(error){
        throw new ApiError(401,error?.message || "Invalid refresh token")
    }

})

//Change the oldPassword with new password
const changeCurrentPassword=asyncHandler(async(req,res)=>{
    const{oldPassword,newPassword}=req.body

    const user= await User.findById(req.user?._id)
    const isPasswordCorrect= await user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect){
        throw new ApiError(400,"Invalid old Password")
    }

    user.password=newPassword
    await user.save({validateBeforeSave:false})

    return res
    .status(200)
    .json(new ApiResponse(200,{},"Password changed successfully"))
})

//fetch current user
const getCurrentUser=asyncHandler(async(req,res)=>{
    return res
        .status(200)
        .json(new ApiResponse(200,req.user,"Current user fetched successfully"))
})

//update user details
const updateAccountDetails=asyncHandler(async(req,res)=>{
    const {fullName,email}=req.body

    if (!fullName || !email) {
        throw new ApiError(400,"All fields are required")
    }

    const user=await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                fullName:fullName,
                email:email
            }
        },
        {
            new:true
        }
    ).select("-password")

    return res
        .status(200)
        .json(new ApiResponse(200,user,"Account details updated successfully"))
})

//update avatar image
const updateAvatarImage=asyncHandler(async(req,res) => {
    const avatarLocalPath=req.file?.path;

    if (!avatarLocalPath) {
        throw new ApiError(
            400,
            "Avatar file is required in order to update it"
        );
    }

    const user=await User.findById(req.user._id);

    if (!user) {
        throw new ApiError(401, "Unauthorized access");
    }

    // Save old image public_id
    const oldAvatarPublicId=user.avatar?.public_id;

    // Upload new image
    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if (!avatar.url) {
        throw new ApiError(400, "Upload failed");
    }

    // Update MongoDB with new avatar image
    user.avatar={
        url: avatar.url,
        public_id: avatar.public_id
    };  

    await user.save({
        validateBeforeSave: false
    });

    // Delete old image from Cloudinary
    if (oldAvatarPublicId) {
        await deleteFromCloudinary(oldAvatarPublicId);
    }

    const updatedUser=await User.findById(user._id)
        .select("-password -refreshToken");

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                updatedUser,
                "Avatar image updated successfully"
            )
        );
});

//update cover Image
const updateCoverImage=asyncHandler(async(req,res)=>{
    const coverImageLocalPath=req.file?.path

    if(!coverImageLocalPath){
        throw new ApiError(400,"Cover image file is required in order to udpate it")
    }

    const user=await user.findById(req.user._id)

    if(!user){
        throw new ApiError("401","Unauthorized access")
    }

    const oldPublic_id=user.coverImage?.file.public_id

    const coverImage= await uploadOnCloudinary(coverImageLocalPath)

    if(!coverImage.url){
        throw new ApiError(400,"Upload failed")
    }

    user.coverImage={
        url:coverImage.url,
        public_id:coverImage.public_id
    }
    await user.save({
        validateBeforeSave:false
    })

    if(oldPublic_id){
        await deleteFromCloudinary(oldPublic_id)
    }

    const updatedUser=User.findById(req.user._id)-select("-password -refreshToken")

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                updatedUser,
                "Cover image updated successfully"
            )
        )
})

//aggeration pipeline to count subscribers and show no of channels subscribed by the user
const getUserChannelProfile=asyncHandler(async(req,res)=>{
    const {username}=req.params

    if(!username?.trim()){
        throw new ApiError(400,"username is missing")
    }

    const channel=await User.aggregate([
        {
            $match:{
                username:username?.toLowerCase()
            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"channel",
                as:"subscribers"
            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"subscriber",
                as:"subscribedTo"
            }
        },
        {
            $addFields:{
                subscribersCount:{
                    $size:"$subscribers"
                },
                channelsSubscriberToCount:{
                    $size:"$subscribedTo"
                },
                isSubscribed:{
                    $cond:{
                        if:{$in:[req.user?._id,"$subscribers.subscriber"]},
                        then:true,
                        else:false
                    }
                }
            }
        },
        {
            $project:{
                fullName:1,
                username:1,
                subscribersCount:1,
                channelsSubscriberToCount:1,
                isSubscribed:1,
                avatar:1,
                coverImage:1,
                email:1
            }
        }
        
    ])

    if(!channel?.length){
        throw new ApiError(404,"channel does not exist")
    }

    return res
            .status(200)
            .json(
                new ApiResponse(200,channel[0],"User channel fetched successfully")
            )
})
export {registerUser,
        loginUser,
        logoutUser,
        refreshAccessToken,
        changeCurrentPassword,
        getCurrentUser,
        updateAccountDetails,
        updateAvatarImage,
        updateCoverImage,
        getUserChannelProfile
}