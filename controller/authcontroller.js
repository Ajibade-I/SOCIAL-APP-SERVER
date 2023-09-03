const jwt = require("jsonwebtoken");
const bcryptjs = require("bcryptjs");
const { User } = require("../model/User");
const { validateSignup } = require("../lib/validation/authvalidation");
const { BadRequestError } = require("../lib/error");
const {
  sendAccountActivation,
} = require("../lib/message/account-activation-message");

//@Method:POST /auth/signup
//@Desc:To signup a user
//@Access:Public

const SignUp = async (req, res, next) => {
  const error = await validateSignup(req.body);
  if (error) {
    throw new BadRequestError(error);
  }

  const { firstName, lastName, email, phoneNumber, password } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new BadRequestError("User already exists");
    console.log(error);
  }

  const phoneExists = await User.findOne({ phoneNumber });
  if (phoneExists) {
    throw new BadRequestError("Phone number already exists");
  }

  const salt = await bcryptjs.genSalt(10);
  const hashedpassword = await bcryptjs.hash(password, salt);

  const user = new User({
    firstName,
    lastName,
    email,
    phoneNumber,
    password: hashedpassword,
  });

  await user.save();

  const token = await bcryptjs.hash(email.toString(), 10);
  const thirtyMinutes = 30 * 60 * 1000;

  user.AccountactivationToken = token;
  user.AccountTokenExpires = new Date(Date.now() + thirtyMinutes);
  await sendAccountActivation({ email, token });
  res.status(201).json({
    success: true,
    message: "Click the link in your email to activate your account",
  });
};

//@Method:GET /auth/activate-account?token=token
//@Desc: Axtivate account
//@Access:Public

const activateAccount = async (req, res) => {
  const user = await User.findOne({
    AccountactivationToken: req.url.token,
    AccountTokenExpires: { $gt: Date.now() },
  });
  if (!user) {
    throw new BadRequestError("Link has expired.PLease, request new link");
  }
  user.isActivated = true;
  user.AccountactivationToken = undefined;
  user.AccountTokenExpires = undefined;
  await user.save();
  res.status(200).json({ succes: true, msg: "Account activated" });
};

module.exports.SignUp = SignUp;
module.exports.activateAccount = activateAccount;
