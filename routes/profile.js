const express = require("express");
const isLogin = require("../lib/midlleware/auth-middleware");
const {
  followProfile,
  viewFollowing,
  viewFollowers,
  post,
  commentOnPost,
  likePost,
  viewFollowRequests,
  viewProfile,
  followRequestAction,
  editProfile,
} = require("../controller/profilecontroller");
const router = express.Router();

router.post("/follow", isLogin, followProfile);
router.post("/find", isLogin, viewProfile);
router.get("/following", isLogin, viewFollowing);
router.get("/followers", isLogin, viewFollowers);
router.get("/follow-requests", isLogin, viewFollowRequests);
router.put("/edit", isLogin, editProfile);
router.post("/follow-requests/action", isLogin, followRequestAction);
router.post("/post", isLogin, post);
router.post("/:postId/comment", isLogin, commentOnPost);
router.put("/:postId/like", isLogin, likePost);

module.exports = router;
