const { BadRequestError } = require("../lib/error");
const {
  validateAdminSignup,
  adminValidateLogin,
} = require("../lib/validation/authvalidation");
const User = require("../model/User");
const Admin = require("../model/admin");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");

const adminSignUp = async (req, res) => {
  const error = await validateAdminSignup(req.body);
  if (error) {
    throw new BadRequestError(error);
  }

  const { firstName, lastName, email, password } = req.body;
  const salt = await bcryptjs.genSalt(10);
  const hashedPassword = await bcryptjs.hash(password, salt);
  const admin = new Admin({
    firstName,
    lastName,
    email,
    password: hashedPassword,
  });

  await admin.save();

  res.status(200).json({ message: "Signup succesfull" });
};

const adminLogin = async (req, res) => {
  const error = await adminValidateLogin(req.body);
  if (error) {
    throw new BadRequestError(error);
  }

  const { email, password } = req.body;
  const admin = await Admin.findOne({ email });
  if (!admin) {
    throw new BadRequestError("Invalid email or password");
  }
  const isValid = await bcryptjs.compare(password, admin.password);
  if (!isValid) {
    throw new BadRequestError("Invalid email or password");
  }
  const payload = {
    _id: admin._id,
    email: admin.email,
  };

  const token = jwt.sign(payload, process.env.JWT_PRIVATE_KEY);
  const oneDay = 24 * 60 * 60 * 1000;

  res.cookie("accessToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    signed: true,
    expires: new Date(Date.now() + oneDay),
  });

  res.status(200).json({ success: true, message: "Login successful" });
};

const getAllUsers = async (req, res) => {
  const users = await User.find();
  const page = req.query.page;

  const profiles = users.map((user) => user.profile);
  profiles.forEach((profile) => (profile.inbox = undefined));

  if (page) {
    const startingIndex = (page - 1) * 10;
    const lastIndex = startingIndex + 10;
    const profilesByPage = profiles.slice(startingIndex, lastIndex);
    res.status(200).json({ success: true, message: profilesByPage });
    return;
  }
  res.status(200).json({ success: true, message: profiles });
};

// const suspendUser= await (req,res )=>{

// }

module.exports.adminSignUp = adminSignUp;
module.exports.adminLogin = adminLogin;
module.exports.getAllUsers = getAllUsers;
