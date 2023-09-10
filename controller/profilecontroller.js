const {
  BadRequestError,
  Unauthorized,
  NotFoundError,
} = require("../lib/error");
const {
  validateProfileEdit,
  validateRequestAction,
} = require("../lib/validation/authvalidation");
const {
  validatePost,
  validateComment,
} = require("../lib/validation/postvalidation");
const User = require("../model/User");
const Post = require("../model/post");

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

  //send followRequests for private profiles
  if (user.profile.profileType == "private") {
    await User.findOneAndUpdate(
      { _id: user._id },
      { $push: { followRequest: userId } }
    );

    res
      .status(200)
      .json({ message: `You have sent ${userName} a follow request` });
    return;
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

  //add logic for private accounts

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

//@Method:GET /profile/post
//@Desc: make a post
//@Access: private
const post = async (req, res, next) => {
  //validate post
  const error = await validatePost(req.body);
  if (error) {
    throw new BadRequestError(error);
  }

  //implement post for private profiles

  const { title, content } = req.body;
  const userId = req.user._id;

  const post = new Post({
    author: userId,
    title,
    content,
  });

  await post.save();
  res.status(200).json({ success: true, message: "Post made succesfully" });
};

//@Method:POST /profile/find
//@Desc: find and view a profile
//@Access: public

const viewProfile = async (req, res, next) => {
  const userId = req.user._id;
  const { userName } = req.body;

  //find user
  const user = await User.findOne({ "profile.userName": userName });
  if (!user) {
    throw new BadRequestError("Invalid username");
  }

  //find user posts
  let posts = await Post.find({ author: user._id });
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

//@Method:POST /profile/:postId/comment
//@Desc: comment on a post
//@Access: public

const commentOnPost = async (req, res, next) => {
  //validate comment
  const error = await validateComment(req.body);
  if (error) {
    throw new BadRequestError(error);
  }

  const postId = req.params.postId;
  const { message } = req.body;
  const userId = req.user._id;

  //find post
  const post = await Post.findById({ _id: postId });
  if (!post) {
    throw new BadRequestError("Post cannot be found");
  }

  //create comment object
  const comment = {
    user: userId,
    message,
  };

  //add comment object to comments array
  post.comments.push(comment);
  await post.save();

  res.status(200).json({ message: "Comment successful" });
};

//@Method:POST /profile/:postId/like
//@Desc: like a post
//@Access: public

const likePost = async (req, res, next) => {
  const postId = req.params.postId;
  const userId = req.user._id;

  //find post
  const post = await Post.findById({ _id: postId });

  if (post.author.toString() == userId.toString()) {
    throw new BadRequestError("You cannot like your own post");
  }

  //find author
  const author = await User.findById({ _id: post.author });

  if (!post) {
    throw new BadRequestError("Post not found");
  }
  //check if user has already liked post
  const hasLikedPost = await Post.findOne({ _id: postId, likes: userId });

  if (hasLikedPost) {
    await Post.findOneAndUpdate({ _id: postId }, { $pull: { likes: userId } });

    res.status(200).json({
      success: true,
      message: `You unliked ${author.profile.userName}'s post`,
    });
    return;
  }
  //add user to likes array
  await Post.findOneAndUpdate({ _id: postId }, { $push: { likes: userId } });

  res.status(200).json({
    success: true,
    message: `You liked ${author.profile.userName}'s post`,
  });
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

  if (user.followRequest.lenght == 0) {
    res.json({ message: "You have no friend requets" });
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

//@Method:PUT /profile/group
//@Desc: create a group
//@Access: private

module.exports.viewProfile = viewProfile;
module.exports.followProfile = followProfile;
module.exports.viewFollowing = viewFollowing;
module.exports.viewFollowers = viewFollowers;
module.exports.editProfile = editProfile;
module.exports.post = post;
module.exports.likePost = likePost;
module.exports.commentOnPost = commentOnPost;
module.exports.viewFollowRequests = viewFollowRequests;
module.exports.followRequestAction = followRequestAction;
