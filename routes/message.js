const express = require("express");
const isLogin = require("../lib/midlleware/auth-middleware");
const {
  message,
  createGroup,
  messageGroup,
  getMessages,
  removeFromGroup,
  addToGroup,
  makeAnAdmin,
} = require("../controller/messagecontroller");
const router = express.Router();

router.post("/:userId", isLogin, message);
router.post("/create/group", isLogin, createGroup);
router.get("/:messageId/view", isLogin, getMessages);
router.post("/:groupId/message", isLogin, messageGroup);
router.put("/:groupId/remove", isLogin, removeFromGroup);
router.put("/:groupId/add", isLogin, addToGroup);
router.put("/:groupId/admin", isLogin, makeAnAdmin);

module.exports = router;
