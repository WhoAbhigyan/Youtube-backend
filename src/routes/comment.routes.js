import {Router} from "express"
import { verifyJWT } from '../middlewares/auth.middleware.js'
import {getVideoComments,
        addComment,
        updateComment,
        deleteComment
}from "../controllers/comment.controller.js"

const router=Router()

router.route("/comment").get(verifyJWT,getVideoComments)
router.route("/:videoId").post(verifyJWT,addComment)
router.route("/:commentId").patch(verifyJWT,updateComment)
router.route("/:commentId").delete(verifyJWT,deleteComment)

export default router