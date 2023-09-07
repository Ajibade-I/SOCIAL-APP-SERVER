const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: { type: String },
  content: { type: String, required: true },
  comments: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      message: { type: String, required: true },
      date: { type: Date, default: Date.now },
    },
  ],
  likes: [
    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  ],
  dateCreated: { type: Date, default: Date.now },
});

const Post = mongoose.model("Post", postSchema);
module.exports = Post;
