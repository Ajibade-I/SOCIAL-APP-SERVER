const express = require("express");
const isLogin = require("../lib/midlleware/auth-middleware");
const {
  message,
  createGroup,
  messageGroup,
  getMessages,
} = require("../controller/messagecontroller");
const router = express.Router();

router.post("/:userId", isLogin, message);
router.post("/create/group", isLogin, createGroup);
router.get("/:messageId/view", isLogin, getMessages);
router.post("/:groupId/message", isLogin, messageGroup);

module.exports = router;
