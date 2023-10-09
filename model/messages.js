const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  conversers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  ],
  messages: [
    {
      sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      message: { type: String, minlength: 1 },
      timestamp: { type: Date, default: Date.now },
    },
  ],
  admins: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

messageSchema.pre("save", function (next) {
  this.conversers = this.conversers.sort();
  next();
});

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;
