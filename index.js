require("dotenv").config();
require("express-async-errors");
const express = require("express");
const { dbConnect } = require("./lib/dbconnect");
const port = process.env.PORT || 5400;
const authRoutes = require("./routes/auth");
const { notFound, errorHandler } = require("./lib/midlleware/error-middleware");
const app = express();

app.use(express.json());

app.use("/api/auth", authRoutes);

app.use(notFound);
app.use(errorHandler);

dbConnect();
app.listen(port, () => console.log(`Server listening on port ${port}....`));
