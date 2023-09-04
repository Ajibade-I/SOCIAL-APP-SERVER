require("dotenv").config();
require("express-async-errors");
const express = require("express");
const { dbConnect } = require("./lib/dbconnect");
const port = process.env.PORT || 5400;
const { notFound, errorHandler } = require("./lib/midlleware/error-middleware");
const { authRoutes, homeRoutes } = require("./routes");
const app = express();

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", homeRoutes);

app.use(notFound);
app.use(errorHandler);

dbConnect();
app.listen(port, () => console.log(`Server listening on port ${port}....`));
