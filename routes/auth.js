const express = require("express");
const {
  SignUp,
  activateAccount,
  Login,
  forgotPassword,
  resetPassword,
  logOut,
  deleteAccount,
  editAccount,
  blockAccount,
  resetPasswordLoggedIn,
} = require("../controller/authcontroller");
const { isLogin } = require("../lib/midlleware/auth-middleware");

const router = express.Router();

router.post("/signup", SignUp);
router.post("/login", Login);
router.delete("/logout", logOut);
router.put("/edit", isLogin, editAccount);
router.put("/block", isLogin, blockAccount);
router.delete("/delete", isLogin, deleteAccount);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password", resetPassword);
router.put("/reset-password/auth", isLogin, resetPasswordLoggedIn);
router.get("/activate-account", activateAccount);

module.exports = router;
