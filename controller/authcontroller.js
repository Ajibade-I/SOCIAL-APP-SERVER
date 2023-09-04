const jwt = require("jsonwebtoken");
const bcryptjs = require("bcryptjs");
const { User } = require("../model/User");
const {
  validateSignup,
  validateLogin,
} = require("../lib/validation/authvalidation");
const { BadRequestError } = require("../lib/error");
const {
  sendAccountActivation,
} = require("../lib/message/account-activation-message");
const sendPasswordReset = require("../lib/message/password-reset-message");
const {
  sendSuccessfulPasswordReset,
} = require("../lib/message/password-reset-succesful");
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

//@Method:POST /auth/login
//@Desc:To login a user
//@Access:Private
const Login = async (req, res) => {
  const error = await validateLogin(req.body);
  if (error) {
    throw new BadRequestError(error);
  }
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    throw new BadRequestError("Invalid email or password");
  }

  const valid = await bcryptjs.compare(password, user.password);

  if (!valid) {
    throw new BadRequestError("Invalid email or password");
  }

  if (!user.isActivated) {
    if (user.AccountTokenExpires < Date.now()) {
      const token = await bcryptjs.hash(email.toString(), 10);
      const thirtyMinutes = 30 * 60 * 1000;

      user.AccountactivationToken = token;
      user.AccountTokenExpires = new Date(Date.now() + thirtyMinutes);

      await sendAccountActivation({ email, token });
      res.json({
        msg: "Account not activated. Click the link in your email to activate your account",
      });
    }
    res.json({
      msg: "Account not activated. Click the link in your email to activate your account",
    });
  }

  const payload = {
    _id: user._id,
    email: user.email,
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

//@Method:POST auth/forgot-password
//@Access:Private
//@Desc: to request for password reset

const forgotPassword = async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    throw new BadRequestError("Invalid email");
  }
  const user = await User.findOne({ email });
  if (!user) {
    throw new BadRequestError("User does not exist");
  }

  const token = await bcryptjs.hash(email.toString(), 10);
  const thirtyMinutes = 30 * 60 * 1000;

  user.passwordResetToken = token;
  user.passwordResetExpired = new Date(Date.now() + thirtyMinutes);

  await user.save();

  await sendPasswordReset({ email, token });

  res.status(200).json({
    success: true,
    message: "Check your email for password reset link",
  });
};
//@Method: GET auth/reset-password
//@Desc: reset password
//@Access: Private

const resetPassword = async (req, res, next) => {
  const token = req.url.token;
  const user = await User.findOne({
    passwordResetToken: token,
    passwordResetExpired: { $gt: Date.now() },
  });
  if (!user) {
    throw new BadRequestError("Link has expired, Please request new link ");
  }
  const { newpassword } = req.body;
  const salt = await bcryptjs.genSalt(10);
  const hashedpassword = await bcryptjs.hash(newpassword, salt);

  user.password = hashedpassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpired = undefined;
  const email = user.email;
  const firstName = user.firstName;
  await user.save();

  await sendSuccessfulPasswordReset({ email, firstName });

  res.status(200).json({ success: true, message: "Account activated" });
};

//@Method:DELETE auth/logout
//@Desc:logout
//@Access:Private

const logOut = async (req, res, next) => {
  res.cookie("accessToken", "Logout", {
    httpOnly: true,
    signed: true,
    expires: new Date(Date.now()),
  });
  res.status(200).json({ success: true, msg: "User logged out" });
};

module.exports.SignUp = SignUp;
module.exports.Login = Login;
module.exports.logOut = logOut;
module.exports.activateAccount = activateAccount;
module.exports.forgotPassword = forgotPassword;
module.exports.resetPassword = resetPassword;
