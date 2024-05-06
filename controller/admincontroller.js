const { BadRequestError, NotFoundError } = require("../lib/error");
const {
  sendAccountActivation,
} = require("../lib/message/account-activation-message");
const { validateSignup } = require("../lib/validation/authvalidation");
const User = require("../model/User");
const bcryptjs = require("bcryptjs");
const Post = require("../model/post");
const {
  succesResponse,
  pagenation,
} = require("../lib/helpers/utility-functions");

//@Method: POST  /admin/signup
//@Description : admin signup
//@Access: private

const adminSignUp = async (req, res, next) => {
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
  user.accountRole = "admin";
  await user.save();

  // send activation email
  await sendAccountActivation({ email, token });

  return succesResponse(
    res,
    "Click the link in your email to activate your account"
  );
};

const getAllUsers = async (req, res) => {
  const page = req.query.page;
  let users;
  users = await User.find().select("-password -inbox");
  if (page) {
    users = pagenation(page, users);
  }
  res.status(200).json({ success: true, message: users });
  return succesResponse(res, "", users);
};

//@Method: PUT /admin/:userId/suspend
//@Description : suspend an account
//@Access: private

const suspendUser = async (req, res) => {
  const userId = req.params.userId;

  //find user
  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError("User not found");
  }

  //change user account status to suspended
  user.accountStatus = "suspended";

  await user.save(
    res.status(200).json({ success: true, message: "User suspended" })
  );
};

//@Method: GET /admin/suspended-users
//@Description : admin signup
//@Access: private

const getSuspendedUsers = async (req, res) => {
  const page = req.query.page;
  let suspendUsers;
  //find users with accountStatus = suspended
  suspendUsers = await User.find({ accountStatus: "suspended" }).select(
    "-password -inbox"
  );

  if (!suspendUsers) {
    res.status(200).json({ success: true, message: "No suspended users " });
    return;
  }

  //pagenation logic
  if (page) {
    suspendUsers = pagenation(page, suspendUsers);
  }

  return succesResponse(res, "Suspended accounts", suspendUsers);
};

//@Method: POST /admin/:userId/activate
//@Description : admin signup
//@Access: private

const activateUser = async (req, res) => {
  const userId = req.params.userId;

  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError("User not found");
  }

  user.accountStatus = "active";

  await user.save();
  return succesResponse(res, "User activate");
};

//@Method: POST /admin/:postId/delete
//@Description : admin signup
//@Access: private

const deletePost = async (req, res) => {
  const postId = req.params.postId;

  const postFound = await Post.findById(postId);
  if (!postFound) {
    throw new NotFoundError("Post not found");
  }

  const post = await Post.findByIdAndDelete(postId);

  return succesResponse(res, "Post deleted");
};

//@Method: POST  /admin/posts
//@Description : admin signup
//@Access: private

const getAllPosts = async (req, res) => {
  const page = req.query.page;
  let posts;
  posts = await Post.find();

  if (page) {
    posts = pagenation(page, posts);
  }

  return succesResponse(res, "", posts);
};

module.exports = {
  adminSignUp,
  getAllUsers,
  suspendUser,
  activateUser,
  getSuspendedUsers,
  getAllPosts,
  deletePost,
};
