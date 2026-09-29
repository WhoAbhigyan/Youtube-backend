import { Router } from "express";

import {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    updatePlaylist,
    deletePlaylist
} from "../controllers/playlist.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();

router.post("/", verifyJWT, createPlaylist);
router.get("/user/:userId", verifyJWT, getUserPlaylists);
router.get("/:playlistId", verifyJWT, getPlaylistById);
router.post(
    "/add/:playlistId/:videoId",
    verifyJWT,
    addVideoToPlaylist
);
router.delete(
    "/remove/:playlistId/:videoId",
    verifyJWT,
    removeVideoFromPlaylist
);
router.put("/:playlistId", verifyJWT, updatePlaylist);
router.delete("/:playlistId", verifyJWT, deletePlaylist);
export default router;