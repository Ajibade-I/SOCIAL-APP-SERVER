const mongoose = require("mongoose");
const conn = mongoose.connection;

const dbConnect = () => {
  mongoose.connect(process.env.MONGO_URI, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  });
  conn.on("error", (error) =>
    console.log("Mongoose connection error: ", error)
  );
  conn.once("open", () => console.log("Connected to mongoDB"));
};

module.exports.dbConnect = dbConnect;
module.exports.conn = conn;
