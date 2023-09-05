const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  userName: {
    type: String,
    minlength: 2,
    maxlength: 25,
    required: true,
    unique: true,
  },
  bio: {
    type: String,
    minlength: 3,
    maxlength: 250,
  },
  profileType: {
    type: String,
    enum: ["public", "private"],
    default: "public",
  },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Profile" }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: "Profile" }],
});

const Profile = mongoose.model("Profile", profileSchema);
module.exports = Profile;
