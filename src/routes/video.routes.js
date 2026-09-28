import {upload} from '../middlewares/multer.middleware.js'
import Router from "express"
import { getAllVideos,
        uploadVideo,
        getVideoById,
        updateVideo,
        deleteVideo,
        togglePublishStatus
 } from '../controllers/video.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
const router=Router();

router.post(
    "/upload",
    verifyJWT,
    upload.fields([
        {name:"videoFile",maxCount:1},
        {name:"thumbnail",maxCount:1}
    ]),
    uploadVideo
)
router.get("/allVideos",verifyJWT,getAllVideos)
router.get("/:videoId", verifyJWT, getVideoById);
router.patch(
    "/:videoId",
    verifyJWT,
    upload.fields([
        { name: "thumbnail", maxCount: 1 }
    ]),
    updateVideo
);
router.delete(
    "/:videoId",
    verifyJWT,
    deleteVideo
);
router.patch(
    "/toggle-publish/:videoId",
    verifyJWT,
    togglePublishStatus
);
export default router;