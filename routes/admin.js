const express = require("express");
const {
  adminSignUp,
  getAllUsers,
  suspendUser,
  getSuspendedUsers,
  activateUser,
  getAllPosts,
  deletePost,
} = require("../controller/admincontroller");
const { isLogin, isAdmin } = require("../lib/midlleware/auth-middleware");
const router = express.Router();

router.post("/signup", adminSignUp);

router.get("/users", isLogin, isAdmin, getAllUsers);
router.put("/:userId/suspend", isLogin, isAdmin, suspendUser);
router.put("/:userId/activate", isLogin, isAdmin, activateUser);
router.get("/suspended-users", isLogin, isAdmin, getSuspendedUsers);
router.get("/posts", isLogin, isAdmin, getAllPosts);
router.delete("/:postId/delete", isLogin, isAdmin, deletePost);

module.exports = router;
