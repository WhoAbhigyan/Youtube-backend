import { Router } from "express";

import {
    getTweets,
    createTweet,
    deleteTweet,
    updateTweet
} from "../controllers/tweet.controller.js";

import { verifyToken } from "../middlewares/verifyToken.js";

const router = Router();

router.get("/my-tweets", verifyToken, getTweets);
router.post("/create-tweet", verifyToken, createTweet);
router.delete("/:tweetId", verifyToken, deleteTweet);
router.put("/:tweetId", verifyToken, updateTweet);

export default router;