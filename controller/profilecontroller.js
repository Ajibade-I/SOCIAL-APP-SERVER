const { BadRequestError } = require("../lib/error");
const {
  createModifiedMyPostObject,
  updateChangedProfileProperties,
  handleLikesMessage,
  createModifiedViewPostObject,
  acceptingOrDecliningFollowRequest,
  followOrUnfollow,
} = require("../lib/helpers/functions/profilefunctions");
const {
  validateProfileEdit,
  validateRequestAction,
} = require("../lib/validation/authvalidation");
const User = require("../model/User");
const Post = require("../model/post");

//@Method:Get /profile/
//@Desc: view my profile
//@Access: private

const myProfile = async (req, res, next) => {
  const userId = req.user._id;
  const user = await User.findById({ _id: userId });
  if (!user) {
    throw new BadRequestError("Login to view your profile");
  }

  // create object containing user properties
  const Your_Profile = {
    username: user.profile.userName,
    bio: user.profile.bio,
    followers: user.profile.followers.length,
    following: user.profile.following.length,
  };

  //find users posts
  const posts = await Post.find({ author: userId });
  if (posts.length === 0) {
    res.status(200).json({ Your_Profile, message: "You have no posts" });
    return;
  }
  const postsLikes = await Post.find({ author: userId })
    .populate("likes", "profile.userName")
    .select("profile.userName");

  const postsComment = posts
    .map((post) =>
      post.comments.map((comment) => ({
        userName: comment.userName,
        message: comment.message,
      }))
    )
    .flat();
  //map out usernames of the post's likes
  const likesUsernames = postsLikes
    .map((postLike) => postLike.likes.map((like) => like.profile.userName))
    .flat();

  let likesMessage = handleLikesMessage(likesUsernames);

  //create new post object containig selected properties
  const Your_Posts = createModifiedMyPostObject(
    posts,
    likesMessage,
    postsComment
  );

  res.status(200).json({ Your_Profile, Your_Posts });
};

//@Method:POST /profile/follow
//@Desc: follow profile
//@Access : Private

const followProfile = async (req, res, next) => {
  const { userName } = req.body;
  const userId = req.user._id;

  //find user
  const user = await User.findOne({ "profile.userName": userName });
  if (!user) {
    throw new BadRequestError("User does not exist");
  }

  //prevent user from folowing own profile
  if (userId.toString() === user._id.toString()) {
    throw new BadRequestError("You cannot follow yourself");
  }

  const followeeId = user._id;

  const response = await followOrUnfollow(user, { userId, followeeId });

  res.status(200).json(response);
};

//@Method:GET /profile/following
//@Desc: get following
//@Access: private

const viewFollowing = async (req, res, next) => {
  const userId = req.user._id;

  //find user and populate followers field
  const user = await User.findById({ _id: userId })
    .populate({
      path: "profile.following",
      model: "User",
    })
    .select("profile.following");

  //get the usernames of the following
  const names_following = user.profile.following.map(
    (user) => user.profile.userName
  );
  if (names_following.length == 0) {
    res.json("You are not following anyone");
    return;
  }

  res.json({ message: `You are following${names_following}` });
};

//@Method:GET /profile/followers
//@Desc: get followers
//@Access: private

const viewFollowers = async (req, res, next) => {
  const userId = req.user._id;

  //find user and populate followers field
  const user = await User.findById({ _id: userId })
    .populate({
      path: "profile.followers",
      model: "User",
    })
    .select("profile.followers");

  //get usernames of followers
  const names_followers = user.profile.followers.map(
    (user) => user.profile.userName
  );
  if (names_followers.length == 0) {
    res.json("You have no followers");
    return;
  }

  res.json(names_followers);
};

//@Method:POST /profile/find
//@Desc: find and view a profile
//@Access: public

const findProfile = async (req, res, next) => {
  const userId = req.user._id;
  const { userName } = req.body;

  //find user
  const user = await User.findOne({ "profile.userName": userName });
  if (!user) {
    throw new BadRequestError("Invalid username");
  }

  //find user posts
  let posts = await Post.find({ author: user._id }).populate(
    "comments",
    "message"
  );
  if (!posts) {
    posts = `${userName} has no posts`;
  }

  //create profile object
  const profile = {
    Username: user.profile.userName,
    accountType: user.profile.profileType,
    followers: user.profile.followers.length,
    following: user.profile.following.length,
  };

  // if the profile is private
  if (user.profile.profileType === "private") {
    //check if user follows the private profile
    const isaFollower = user.profile.followers.includes(userId);
    if (!isaFollower) {
      res.status(200).json({
        profile,
        message: `only followers of ${userName} can view their post `,
      });
      return;
    }
  }
  //select required post properties
  const userPosts = createModifiedViewPostObject(posts);

  res.status(200).json({ profile, userPosts });
};

//@Method:GET /profile/follow-requests
//@Desc: manage follow requests
//@Access: private

const viewFollowRequests = async (req, res, next) => {
  const userId = req.user._id;

  //check profile type
  if (req.user.profile.profileType !== "private") {
    throw new BadRequestError("Only private accounts have follow requests");
  }

  //find user and populate follow request field
  const user = await User.findById({ _id: userId })
    .populate({ model: "User", path: "followRequest" })
    .select("followRequest");

  //username of followrequests
  const userFollowRequests = user.followRequest.map(
    (followRequest) => followRequest.profile.userName
  );

  if (user.followRequest.length == 0) {
    res.json({ message: "You have no follow requets" });
    return;
  }
  res
    .status(200)
    .json({ message: `You have follow requests from ${userFollowRequests}` });
};

//@Method:POST /profile/follow-requests/action
//@Desc: manage follow requests
//@Access: private

const followRequestAction = async (req, res, next) => {
  //valudate request body
  const error = await validateRequestAction(req.body);
  if (error) {
    throw new BadRequestError(error);
  }

  const userId = req.user._id;
  const { action, username } = req.body;

  //find requester by username
  const user = await User.findOne({ "profile.userName": username });
  if (!user) {
    throw new BadRequestError("Username not found");
  }
  const requesterId = user._id;
  const response = await acceptingOrDecliningFollowRequest(action, {
    userId,
    requesterId,
    username,
  });

  res.status(200).json(response);
};

//@Method:PUT /profile/edit
//@Desc: edit profile
//@Access: private

const editProfile = async (req, res, next) => {
  const userId = req.user._id;
  const error = await validateProfileEdit(req.body);
  if (error) {
    throw new BadRequestError(error);
  }
  let user = await User.findById({ _id: userId });

  let { userName, bio, profileType } = req.body;

  //update the provided fields by the body
  user = await updateChangedProfileProperties(user, {
    userName,
    bio,
    profileType,
  });

  await user.save();

  res.json({ message: "Account updated succesfully" });
};

module.exports.myProfile = myProfile;
module.exports.findProfile = findProfile;
module.exports.followProfile = followProfile;
module.exports.viewFollowing = viewFollowing;
module.exports.viewFollowers = viewFollowers;
module.exports.editProfile = editProfile;
module.exports.viewFollowRequests = viewFollowRequests;
module.exports.followRequestAction = followRequestAction;
