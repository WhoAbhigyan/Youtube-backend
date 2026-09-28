import { Router } from "express";

import {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    updatePlaylist,
    deletePlaylist,
} from "../controllers/playlist.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/", verifyJWT, createPlaylist);
router.get("/", verifyJWT, getUserPlaylists);
router.get("/:playlistId", verifyJWT, getPlaylistById);
router.put("/:playlistId", verifyJWT, updatePlaylist);
router.delete("/:playlistId", verifyJWT, deletePlaylist);

export default router;