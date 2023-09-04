const express = require("express");
const Home = require("../controller/homecontroller");
const router = express.Router();

router.get("/home", Home);

module.exports = router;
