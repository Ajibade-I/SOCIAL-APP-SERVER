const express = require("express");
const {
  SignUp,
  activateAccount,
  Login,
  forgotPassword,
  resetPassword,
  logOut,
  deleteUser,
} = require("../controller/authcontroller");
const isLogin = require("../lib/midlleware/auth-middleware");
const router = express.Router();

router.post("/signup", SignUp);
router.post("/login", Login);
router.delete("/logout", logOut);
router.delete("/delete", isLogin, deleteUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password?token=token", resetPassword);
router.get("/activate-account?token=token", activateAccount);

module.exports = router;
