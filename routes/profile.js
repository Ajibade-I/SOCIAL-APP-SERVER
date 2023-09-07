const express = require("express");
const isLogin = require("../lib/midlleware/auth-middleware");
const {
  followProfile,
  viewFollowing,
  viewFollowers,
  post,
  commentOnPost,
  likePost,
} = require("../controller/profilecontroller");
const router = express.Router();

router.post("/follow", isLogin, followProfile);
router.get("/following", isLogin, viewFollowing);
router.get("/followers", isLogin, viewFollowers);
router.post("/post", isLogin, post);
router.post("/:postId/comment", isLogin, commentOnPost);
router.put("/:postId/like", isLogin, likePost);

module.exports = router;
