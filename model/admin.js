const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    min: 2,
    max: 15,
  },
  lastName: {
    type: String,
    required: true,
    min: 2,
    max: 15,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    maxlength: 255,
    required: true,
  },
  suspended,
});

const Admin = mongoose.model("Admin", adminSchema);

module.exports = Admin;
