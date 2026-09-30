import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { ApiError } from "./utils/ApiError.js";
import { ApiResponse } from "./utils/ApiResponse.js";

const app = express();

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))
app.use(express.json({
    limit: "16kb"
}));
app.use(express.urlencoded({
    extended: true,
    limit: "16kb"
}));
app.use(express.static("public"));
app.use(cookieParser());

app.get("/", (req, res) => {
    res.send("Backend is running 🚀");
});

//Routes import
import userRouter from "./routes/user.routes.js";
import commentRouter from "./routes/comment.routes.js"
import likeRouter from "./routes/like.routes.js"
import tweetRouter from "./routes/tweet.routes.js"
import subscriptionRouter from "./routes/subscription.routes.js"
import playlistRouter from "./routes/playlist.routes.js"
import dashboardRouter from "./routes/dashboard.routes.js"
import videoRouter from "./routes/video.routes.js"
import healthCheckRouter from "./routes/healthcheck.routes.js"

//Routes
app.use('/api/v1/users',userRouter)
//https://localhost:5000/api/v1/users/register
app.use('/api/v1/comment',commentRouter)
app.use('/api/v1/likes',likeRouter)
app.use('/api/v1/tweets',tweetRouter)
app.use('/api/v1/subscription',subscriptionRouter)
app.use('/api/v1/playlist',playlistRouter)
app.use('/api/v1/dashboard',dashboardRouter)
app.use('/api/v1/video',videoRouter)
app.use('/api/v1/healthcheck',healthCheckRouter)

//Unknown api route -> json 404 instead of the express html error page
app.use('/api',(req,res)=>{
    res
        .status(404)
        .json(
            new ApiResponse(
                404,
                `Route ${req.originalUrl} not found`
            )
        )
})

//Every controller error reaches here through asyncHandler -> next(err).
//Without this middleware express answers with an html page that contains the stack trace.
app.use((err,req,res,next)=>{
    if(res.headersSent){
        return next(err)
    }

    const isApiError=err instanceof ApiError
    const statusCode=isApiError ? err.statusCode : (err.statusCode || err.status || 500)

    //log unexpected failures on the server, never send them to the client
    if(!isApiError){
        console.error("Unhandled error:",err)
    }

    const message=isApiError
        ? err.message
        : statusCode < 500
            ? err.message || "Request failed"
            : "Something went wrong"

    res
        .status(statusCode)
        .json(
            new ApiResponse(
                statusCode,
                message,
                err.errors?.length ? err.errors : undefined
            )
        )
})

export default app;
