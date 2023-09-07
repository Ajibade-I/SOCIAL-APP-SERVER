const {
  BadRequestError,
  Unauthorized,
  NotFoundError,
} = require("../lib/error");
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

  const user = await User.findOne({ "profile.userName": userName });
  if (!user) {
    throw new BadRequestError("User does not exist");
  }

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

module.exports.followProfile = followProfile;
module.exports.viewFollowing = viewFollowing;
module.exports.viewFollowers = viewFollowers;
module.exports.post = post;
module.exports.likePost = likePost;
module.exports.commentOnPost = commentOnPost;
