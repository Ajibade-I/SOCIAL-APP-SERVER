const express = require("express");
const isLogin = require("../lib/midlleware/auth-middleware");
const {
  followProfile,
  viewFollowing,
  viewFollowers,
  viewFollowRequests,
  findProfile,
  followRequestAction,
  editProfile,
  myProfile,
} = require("../controller/profilecontroller");
const router = express.Router();

router.get("/", isLogin, myProfile);
router.post("/follow", isLogin, followProfile);
router.post("/find", isLogin, findProfile);
router.get("/following", isLogin, viewFollowing);
router.get("/followers", isLogin, viewFollowers);
router.get("/follow-requests", isLogin, viewFollowRequests);
router.put("/edit", isLogin, editProfile);
router.post("/follow-requests/action", isLogin, followRequestAction);

module.exports = router;
