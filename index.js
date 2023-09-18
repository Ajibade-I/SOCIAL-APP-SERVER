require("dotenv").config();
require("express-async-errors");
const express = require("express");
const { dbConnect } = require("./lib/dbconnect");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const compression = require("compression");
const port = process.env.PORT || 5400;
const { notFound, errorHandler } = require("./lib/midlleware/error-middleware");
const {
  authRoutes,
  homeRoutes,
  profileRoutes,
  postRoutes,
  messageRoutes,
} = require("./routes");
const app = express();

app.use(express.json());
app.use(cookieParser(process.env.JWT_PRIVATE_KEY));

app.use(helmet());
app.use(compression({ level: 6, threshold: 0 }));

app.use("/api/auth", authRoutes);
app.use("/api/users", homeRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/post", postRoutes);
app.use("/api/message", messageRoutes);
app.use(notFound);
app.use(errorHandler);

dbConnect();
app.listen(port, () => console.log(`Server listening on port ${port}....`));
