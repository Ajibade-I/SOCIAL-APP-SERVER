const express = require("express");
const { homePage, viewPostsByTopic } = require("../controller/homecontroller");
const isLogin = require("../lib/midlleware/auth-middleware");
const router = express.Router();

router.get("/home", isLogin, homePage);
router.post("/home/search", isLogin, viewPostsByTopic);

module.exports = router;
