const express = require("express");
const createProfile = require("../controller/profilecontroller");
const isLogin = require("../lib/midlleware/auth-middleware");
const router = express.Router();

router.post("/:userId/create-profile", isLogin, createProfile);

module.exports = router;
