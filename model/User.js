const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      minlength: 2,
      maxlength: 50,
      required: true,
    },
    lastName: {
      type: String,
      minlength: 2,
      maxlength: 50,
      required: true,
    },
    profile: {
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
    },
    phoneNumber: {
      type: String,
      trim: true,
      maxlength: 15,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    isActivated: {
      type: Boolean,
      default: false,
    },

    AccountactivationToken: String,
    AccountTokenExpires: Date,
    passwordResetToken: String,
    passwordResetExpired: Date,
  },
  { timestamp: true }
);

const User = mongoose.model("User", userSchema);

module.exports.User = User;
