import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

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

//Routes
app.use('/api/v1/users',userRouter)
//https://localhost:5000/api/v1/users/register
app.use('/api/v1/comment',commentRouter)
app.use('/api/v1/likes',likeRouter)

export default app;