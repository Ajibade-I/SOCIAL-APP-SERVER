const express = require("express");
const {
  SignUp,
  activateAccount,
  Login,
  forgotPassword,
  resetPassword,
  logOut,
} = require("../controller/authcontroller");
const router = express.Router();

router.post("/signup", SignUp);
router.post("/login", Login);
router.delete("/logout", logOut);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password?token=token", resetPassword);
router.get("/activate-account?token=token", activateAccount);

module.exports = router;
