import { Router } from "express";

import {
    getUserTweets,
    createTweet,
    deleteTweet,
    updateTweet
} from "../controllers/tweet.controller.js";

import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router();

router.get("/my-tweets", verifyJWT, getUserTweets);
router.post("/create-tweet", verifyJWT , createTweet);
router.delete("/:tweetId", verifyJWT, deleteTweet);
router.put("/:tweetId", verifyJWT, updateTweet);

export default router;