const express = require("express");

const {
  post,
  commentOnPost,
  likePost,
  deletePost,
  deleteComment,
} = require("../controller/postcontroller");
const { isLogin } = require("../lib/midlleware/auth-middleware");

const router = express.Router();

router.post("/", isLogin, post);
router.post("/:postId/comment", isLogin, commentOnPost);
router.put("/:postId/like", isLogin, likePost);
router.delete("/delete/:commentId", isLogin, deleteComment);
router.delete("/:postId/delete", isLogin, deletePost);

module.exports = router;
