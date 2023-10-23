const express = require("express");
const {
  adminSignUp,
  adminLogin,
  getAllUsers,
} = require("../controller/admincontroller");
const router = express.Router();

router.post("/signup", adminSignUp);
router.post("/login", adminLogin);
router.get("/users", getAllUsers);

module.exports = router;
