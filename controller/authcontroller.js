const jwt = require("jsonwebtoken");
const bcryptjs = require("bcryptjs");
const User = require("../model/User");
const {
  validateSignup,
  validateLogin,
  validateAccountEdit,
  validatePasswordReset,
} = require("../lib/validation/authvalidation");
const { BadRequestError, Unauthorized } = require("../lib/error");
const {
  sendAccountActivation,
} = require("../lib/message/account-activation-message");

const {
  sendSuccessfulPasswordReset,
} = require("../lib/message/password-reset-succesful");
const {
  updateChangedAuthProperties,
  checkValidation,
} = require("../lib/helpers/functions/authfunctions");
const { sendPasswordReset } = require("../lib/message/password-reset-message");

//@Method:POST /auth/signup
//@Desc:To signup a user
//@Access:Public

const SignUp = async (req, res, next) => {
  //validate request
  const error = await validateSignup(req.body);
  if (error) {
    throw new BadRequestError(error);
  }

  const { firstName, lastName, profile, email, phoneNumber, password } =
    req.body;

  //check if email exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new BadRequestError("User already exists");
  }

  //check if username exists
  const { userName } = profile;
  const usernameExists = await User.findOne({ userName });
  if (usernameExists) {
    throw new BadRequestError("Username has already been taken");
  }

  //check if phone exists
  const phoneExists = await User.findOne({ phoneNumber });
  if (phoneExists) {
    throw new BadRequestError("Phone number already exists");
  }

  //encrypt password
  const salt = await bcryptjs.genSalt(10);
  const hashedpassword = await bcryptjs.hash(password, salt);

  //create new user
  const user = new User({
    firstName,
    lastName,
    profile,
    email,
    phoneNumber,
    password: hashedpassword,
  });

  //create activation token
  const token = await bcryptjs.hash(email.toString(), 10);
  const oneHour = 60 * 60 * 1000;

  //assign activation token to user
  user.AccountactivationToken = token;
  user.AccountTokenExpires = new Date(Date.now() + oneHour);

  await user.save();

  // send activation email
  await sendAccountActivation({ email, token });

  res.status(201).json({
    success: true,
    message: "Click the link in your email to activate your account",
  });
};

//@Method:GET /auth/activate-account
//@Desc: Activate account
//@Access:Private

const activateAccount = async (req, res) => {
  //find user
  const user = await User.findOne({
    AccountactivationToken: req.query.token,
    AccountTokenExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new BadRequestError("Link has expired.PLease, request new link");
  }

  //reassign user properties
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
  //validate login body
  const error = await validateLogin(req.body);
  if (error) {
    throw new BadRequestError(error);
  }
  const { email_or_userName, password } = req.body;

  //find user by email or username
  const user = await User.findOne({
    $or: [
      { email: email_or_userName },
      { "profile.userName": email_or_userName },
    ],
  });

  if (!user) {
    throw new BadRequestError("Invalid email or password");
  }

  //check if password is correct
  const valid = await bcryptjs.compare(password, user.password);
  if (!valid) {
    throw new BadRequestError("Invalid email or password");
  }

  //check if account has been suspended
  if (user.accountStatus !== "active") {
    throw new Unauthorized("Your account has been suspended");
  }

  const email = user.email;
  //check if user is activated
  if (!user.isActivated) {
    const response = await checkValidation(user, email);
    res.status(200).json(response);
    return;
  }

  //create payload
  const payload = {
    _id: user._id,
    email: user.email,
  };

  //encrypt payload to create token
  const token = jwt.sign(payload, process.env.JWT_PRIVATE_KEY);
  const oneDay = 24 * 60 * 60 * 1000;

  //send accessToken as a cookie
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
  let { email } = req.body;
  if (!email) {
    throw new BadRequestError("Invalid email");
  }

  //find user
  const user = await User.findOne({ email });
  if (!user) {
    throw new BadRequestError("User does not exist");
  }

  //create password reset token
  const token = await bcryptjs.hash(email.toString(), 10);
  const thirtyMinutes = 30 * 60 * 1000;

  //assign password reset token to user
  user.passwordResetToken = token;
  user.passwordResetExpired = new Date(Date.now() + thirtyMinutes);

  await user.save();

  //send password reset email
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
  //find user with token and token expiration
  const user = await User.findOne({
    passwordResetToken: req.query.token,
    passwordResetExpired: { $gt: Date.now() },
  });

  if (!user) {
    throw new BadRequestError("Link has expired, Please request new link ");
  }

  const { newpassword } = req.body;
  if (!newpassword) {
    throw new BadRequestError("Invalid password");
  }
  //encrypt new password
  const salt = await bcryptjs.genSalt(10);
  const hashedpassword = await bcryptjs.hash(newpassword, salt);

  //reassign user properties
  user.password = hashedpassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpired = undefined;
  const email = user.email;
  const firstName = user.firstName;

  await user.save();

  await sendSuccessfulPasswordReset({ email, firstName });

  res.status(200).json({ success: true, message: "Password reset succesfull" });
};

//@Method: GET auth/reset-password
//@Desc: reset password
//@Access: Private

const resetPasswordLoggedIn = async (req, res, next) => {
  const userId = req.user._id;
  const user = await User.findById(userId);

  const error = await validatePasswordReset(req.body);
  if (error) {
    throw new BadRequestError(error);
  }
  const { oldPassword, newPassword, repeatPassword } = req.body;

  const isValid = await bcryptjs.compare(oldPassword, user.password);
  if (!isValid) {
    throw new BadRequestError("incorrect password");
  }
  if (newPassword !== repeatPassword) {
    throw new BadRequestError("Passwords do not match");
  }

  const salt = await bcryptjs.genSalt(10);
  const hashedpassword = await bcryptjs.hash(newPassword, salt);
  user.password = hashedpassword;

  await user.save();

  res.status(200).json({ success: true, message: "Password reset succesfull" });
};

//@Method:PUT auth/edit
//@Desc:Edit account
//@Access:private

const editAccount = async (req, res, next) => {
  const error = await validateAccountEdit(req.body);
  if (error) {
    throw new BadRequestError(error);
  }
  const userId = req.user._id;

  let { firstName, lastName, phoneNumber, password } = req.body;

  //find user
  let user = await User.findById(userId);
  //check password
  const valid = await bcryptjs.compare(password, user.password);
  if (!valid) {
    throw new BadRequestError("Invalid password");
  }

  user = updateChangedAuthProperties(user, {
    firstName,
    lastName,
    phoneNumber,
  });

  const accountBody = {
    firstName: user.firstName,
    lastName: user.lastName,
    phoneNumber: user.phoneNumber,
  };

  await user.save();
  res.status(200).json({ message: "Account updated succefully", accountBody });
};

//@Method:DELETE auth/logout
//@Desc:logout
//@Access:Private

const logOut = async (req, res, next) => {
  //expire cookie
  res.cookie("accessToken", "Logout", {
    httpOnly: true,
    signed: true,
    expires: new Date(Date.now()),
  });
  res.status(200).json({ success: true, msg: "User logged out" });
};

//@Method:DELETE auth/delete
//@Desc:logout
//@Access:Private

const deleteAccount = async (req, res, next) => {
  //destructure signed cookie to get accessToken
  const { accessToken } = req.signedCookies;

  //verify if user is logged in
  if (!accessToken) {
    throw new Unauthorized("User must be logged in to delete account");
  }

  //decode accessToken to get user id
  const decoded = await jwt.verify(accessToken, process.env.JWT_PRIVATE_KEY);

  //find and delete user
  req.user = await User.findByIdAndDelete(decoded._id);
  res.status(200).json({ success: true, msg: "User deleted" });
};

//@Method:PUT /auth/block
//@Desc:to block an account
//@Access:Private

const blockAccount = async (req, res, next) => {
  const userId = req.user._id;
  const { userName } = req.body;
  if (!userName) {
    throw new BadRequestError("username required");
  }

  const blocked = await User.findOne({ "profile.userName": userName });
  const user = await User.findById(userId);
  user.blockedAccounts.push(blocked._id);
  await user.save();
  res.status(200).json({ message: "User blocked" });
};

module.exports.SignUp = SignUp;
module.exports.Login = Login;
module.exports.logOut = logOut;
module.exports.activateAccount = activateAccount;
module.exports.forgotPassword = forgotPassword;
module.exports.resetPassword = resetPassword;
module.exports.resetPasswordLoggedIn = resetPasswordLoggedIn;
module.exports.editAccount = editAccount;
module.exports.blockAccount = blockAccount;
module.exports.deleteAccount = deleteAccount;
