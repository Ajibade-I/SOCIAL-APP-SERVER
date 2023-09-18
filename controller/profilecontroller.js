const { BadRequestError } = require("../lib/error");
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
  const userProfile = {
    username: user.profile.userName,
    bio: user.profile.bio,
    followers: user.profile.followers.length,
    following: user.profile.following.length,
  };

  //find users posts
  const posts = await Post.find({ author: userId });
  if (posts.length === 0) {
    res.status(200).json({ userProfile, message: "You have no posts" });
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

  //handle the likes message
  let likesMessage;
  if (likesUsernames.length === 1) {
    likesMessage = `${likesUsernames[0]} liked your post`;
  }
  if (likesUsernames.length === 2) {
    likesMessage = `${likesUsernames[0]} and ${likesUsernames[1]} liked your post`;
  }
  if (likesUsernames.length === 3) {
    likesMessage = `${likesUsernames[0]}, ${likesUsernames[1]} and ${likesUsernames[2]} liked your post`;
  }
  if (likesUsernames.length > 3) {
    likesMessage = `${likesUsernames[0]}, ${likesUsernames[1]} and ${
      likesUsernames.length - 2
    } others liked your post`;
  }

  //create new post object containig selected properties
  const Your_Posts = posts.map((post) => {
    const selectedProperties = new Post(post).toJSON();
    selectedProperties.likes = likesMessage;
    selectedProperties.comments = postsComment;
    delete selectedProperties._id;
    delete selectedProperties.__v;
    delete selectedProperties.author;
    return selectedProperties;
  });

  res.status(200).json({ userProfile, Your_Posts });
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

  //user username
  const followeeUsername = user.profile.userName;

  //check if the user is already following
  const alreadyFollowing = await User.findOne({
    "profile.followers": userId,
  });
  if (alreadyFollowing) {
    //remove from user following
    await User.findOneAndUpdate(
      { _id: user._id },
      { $pull: { "profile.followers": userId } }
    );

    //unfollow
    await User.findOneAndUpdate(
      { _id: userId },
      { $pull: { "profile.following": user._id } }
    );

    res.status(200).json({ message: `You unfollowed ${followeeUsername}` });
    return;
  }

  //send followRequests for private profiles
  if (user.profile.profileType == "private") {
    //check if user already has follow request
    const hasFollowRequest = await User.findOne({ followRequest: userId });
    if (hasFollowRequest) {
      //retract follow request
      await User.findOneAndUpdate(
        { _id: user._id },
        { $pull: { followRequest: userId } }
      );
      res
        .status(200)
        .json({ message: `You have cancelled your follow request` });
      return;
    }
    await User.findOneAndUpdate(
      { _id: user._id },
      { $push: { followRequest: userId } }
    );

    res
      .status(200)
      .json({ message: `You have sent ${userName} a follow request` });
    return;
  }

  //Add to user followers
  await User.findOneAndUpdate(
    { _id: user._id },
    { $push: { "profile.followers": userId } }
  );

  //Add to user following
  await User.findOneAndUpdate(
    { _id: userId },
    { $push: { "profile.following": user._id } }
  );
  res.status(200).json({
    sucess: true,
    message: `You are now following ${followeeUsername}`,
  });
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
  const userPosts = posts.map((post) => {
    const selectedProperties = new Post(post).toJSON();
    selectedProperties.Likes = selectedProperties.likes.length;
    selectedProperties.Comments = selectedProperties.comments.length;
    delete selectedProperties.author;
    delete selectedProperties.comments;
    delete selectedProperties.likes;
    delete selectedProperties.__v;
    return selectedProperties;
  });

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

//@Method:POst /profile/follow-requests/action
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

  if (action === "accept") {
    //add requester to user followers
    await User.findOneAndUpdate(
      { _id: userId },
      { $push: { "profile.followers": user._id } }
    );
    //remove requester from user followrequests
    await User.findOneAndUpdate(
      { _id: userId },
      { $pull: { followRequest: user._id } }
    );
    //add user to requester following
    await User.findOneAndUpdate(
      { _id: user._id },
      { $push: { "profile.following": userId } }
    );

    res.status(200).json({
      success: true,
      message: `You have accepted ${username}'s follow request`,
    });
  } else {
    //remove requestee from user follow request
    await User.findOneAndUpdate(
      { _id: userId },
      { $pull: { followRequest: user._id } }
    );
    res.status(200).json({
      success: true,
      message: `You have denied ${username}'s follow request`,
    });
  }
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
  const user = await User.findById({ _id: userId });

  let { userName, bio, profileType } = req.body;

  //check if username is provided
  if (userName !== undefined) {
    const usernameExists = await User.findOne({ "profile.userName": userName });
    if (usernameExists) {
      throw new BadRequestError("Username taken");
    }
    user.profile.userName = userName;
    await user.save();
  }
  //check if bio is given
  if (bio !== undefined) {
    user.profile.bio = bio;
    await user.save();
  }
  //check if profiletype is given
  if (profileType !== undefined) {
    user.profile.profileType = profileType;
    await user.save();
  }

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
