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
