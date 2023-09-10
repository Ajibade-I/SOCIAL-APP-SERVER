//@Method: GET user/home
//@Desc: Homepage
//@Acces: Public

const Post = require("../model/post");

const Home = async (req, res) => {
  const posts = await Post.find()
    .populate("author", "profile.userName")
    .sort({ dateCreated: -1 });

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

module.exports = Home;
