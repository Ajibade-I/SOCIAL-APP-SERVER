require("dotenv").config();
require("express-async-errors");
const express = require("express");
const { dbConnect } = require("./lib/dbconnect");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const compression = require("compression");
const port = process.env.PORT || 5400;
const path = require("path");

const { notFound, errorHandler } = require("./lib/midlleware/error-middleware");
const {
  authRoutes,
  homeRoutes,
  profileRoutes,
  postRoutes,
  messageRoutes,
  adminRoutes,
} = require("./routes");
const accesslogs = require("./lib/midlleware/accesslogs");
const app = express();

app.use(express.json());
app.use(cookieParser(process.env.JWT_PRIVATE_KEY));

app.use(helmet());
app.use(compression({ level: 6, threshold: 0 }));

app.use(express.static(path.join(__dirname, "public")));

app.use("/api/admin", accesslogs, adminRoutes);
app.use("/api/auth", accesslogs, authRoutes);
app.use("/api/users", accesslogs, homeRoutes);
app.use("/api/profile", accesslogs, profileRoutes);
app.use("/api/post", accesslogs, postRoutes);
app.use("/api/message", accesslogs, messageRoutes);
app.use(notFound);
app.use(errorHandler);

// index.js
module.exports = (req, res) => {
  res.status(200).send("Welcome to the server!");
};

dbConnect();
app.listen(port, () => console.log(`Server listening on port ${port}....`));
