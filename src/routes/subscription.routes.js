import { Router } from "express";
import {
    getSubscribedChannels,
    getChannelSubscribers,
    toggleSubscription,
} from "../controllers/subscription.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

// Get subscribers of a channel + subscribe/unsubscribe
router
    .route("/c/:channelId")
    .get(getChannelSubscribers)
    .post(toggleSubscription);

// Get channels subscribed to by a user
router
    .route("/u/:subscriberId")
    .get(getSubscribedChannels);

export default router;