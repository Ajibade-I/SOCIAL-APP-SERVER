const express = require("express");
const createProfile = require("../controller/profilecontroller");
const isLogin = require("../lib/midlleware/auth-middleware");
const router = express.Router();

router.post("/create-profile", createProfile);

module.exports = router;
