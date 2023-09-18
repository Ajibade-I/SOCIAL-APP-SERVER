const User = require("../model/User");
const Post = require("../model/post");

//@Method: GET user/home
//@Desc: Homepage
//@Acces: Public

const homePage = async (req, res) => {
  const userId = req.user._id;

  //find user and populate user following field
  const user = await User.findById({ _id: userId })
    .populate("profile.following")
    .select("profile.following");

  //map out the id of user following
  const followingId = user.profile.following.map((user) => user._id);

  //find posts made by user following
  const posts = await Post.find({ author: { $in: followingId } })
    .populate("author", "profile.userName")
    .sort({ dateCreated: -1 });

  //create a new modified post object with selected properties
  const homePosts = posts.map((post) => {
    const selectedProperties = new Post(post).toJSON();
    selectedProperties.Likes = selectedProperties.likes.length;
    selectedProperties.Comments = selectedProperties.comments.length;
    selectedProperties.author = selectedProperties.author.profile;
    delete selectedProperties.likes;
    delete selectedProperties.comments;
    delete selectedProperties.__v;
    delete selectedProperties._id;
    return selectedProperties;
  });
  res.json({ msg: "WELCOME TO THE COMMUNITY", homePosts });
};

//@Method: GET user/home
//@Desc: Homepage
//@Acces: Public

const viewPostsByTopic = async (req, res, next) => {
  const userId = req.user._id;

  //find user and populate following
  const user = await User.findById({ _id: userId })
    .populate("profile.following")
    .select("profile.following");

  //map out the ids of the following field
  const followingId = user.profile.following.map((user) => user._id);
  const { title } = req.body;

  //find posts made by the user following by topic
  const postByTitle = await Post.find({
    author: { $in: followingId },
    title: title,
  })
    .populate("author", "profile.userName")
    .sort({ dateCreated: -1 });
  if (!postByTitle) {
    res.status(404).json({ message: "There are no posts under this topic" });
    return;
  }

  //create new modified post object with selected properties
  const modifiedPosts = postByTitle.map((post) => {
    const selectedProperties = new Post(post).toJSON();
    selectedProperties.Likes = selectedProperties.likes.length;
    selectedProperties.Comments = selectedProperties.comments.length;
    selectedProperties.author = selectedProperties.author.profile;
    delete selectedProperties.likes;
    delete selectedProperties.comments;
    delete selectedProperties.__v;
    delete selectedProperties._id;
    return selectedProperties;
  });
  res.status(200).json(modifiedPosts);
};
module.exports.homePage = homePage;
module.exports.viewPostsByTopic = viewPostsByTopic;
