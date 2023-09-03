const express = require("express");
const { SignUp, activateAccount } = require("../controller/authcontroller");
const router = express.Router();

router.post("/signup", SignUp);
router.get("/activate-account?token=token", activateAccount);
module.exports = router;
