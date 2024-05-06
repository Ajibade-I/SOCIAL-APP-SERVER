const { NotFoundError } = require("../lib/error");
const {
  createModifiedHomePostObject,
} = require("../lib/helpers/functions/homefunctions");
const {
  succesResponse,
  pagenation,
} = require("../lib/helpers/utility-functions");
const User = require("../model/User");
const Post = require("../model/post");

//@Method: GET user/home
//@Desc: Homepage
//@Acces: Public

const homePage = async (req, res) => {
  const userId = req.user._id;
  const page = req.query.page;

  //find user and populate user following field
  const user = await User.findById({ _id: userId })
    .populate("profile.following")
    .select("profile.following");

  //map out the id of user following
  const followingId = user.profile.following.map((user) => user._id);

  //find posts made by user following
  let posts;
  posts = await Post.find({ author: { $in: followingId } })
    .populate("author", "profile.userName")
    .sort({ dateCreated: -1 });

  //create a new modified post object with selected properties
  posts = createModifiedHomePostObject(posts);
  if (page) {
    posts = pagenation(page, posts);
  }
  return succesResponse(res, "WELCOME TO THE COMMUNITY", posts);
};

//@Method: POST users/home/search
//@Desc: view posts by topic
//@Acces: Public

const viewPostsByTopic = async (req, res, next) => {
  const userId = req.user._id;
  const page = req.query.page;

  //find user and populate following
  const user = await User.findById({ _id: userId })
    .populate("profile.following")
    .select("profile.following");

  //map out the ids of the following field
  const followingId = user.profile.following.map((user) => user._id);
  const { title } = req.body;

  //find posts made by the user following by topic
  let posts;
  posts = await Post.find({
    author: { $in: followingId },
    title: { $regex: new RegExp(title, "i") },
  })
    .populate("author", "profile.userName")
    .sort({ dateCreated: -1 });

  if (posts.length == 0) {
    throw new NotFoundError("Post not found");
  }

  //create new modified post object with selected properties
  posts = createModifiedHomePostObject(posts);
  if (page) {
    posts = pagenation(page, posts);
  }
  return succesResponse(res, "WELCOME TO THE COMMUNITY", posts);
};

module.exports = { homePage, viewPostsByTopic };
