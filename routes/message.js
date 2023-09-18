const express = require("express");
const isLogin = require("../lib/midlleware/auth-middleware");
const {
  message,
  getMessages,
  createGroup,
} = require("../controller/messagecontroller");
const router = express.Router();

router.post("/:userId", isLogin, message);
router.get("/:userId/view", isLogin, getMessages);
router.post("/create/group", isLogin, createGroup);

module.exports = router;
