const express = require("express");
const isLogin = require("../lib/midlleware/auth-middleware");
const {
  post,
  commentOnPost,
  likePost,
  deletePost,
} = require("../controller/postcontroller");

const router = express.Router();

router.post("/", isLogin, post);
router.post("/:postId/comment", isLogin, commentOnPost);
router.put("/:postId/like", isLogin, likePost);
router.delete("/:postId/delete", isLogin, deletePost);

module.exports = router;
