const Post = require("../../../model/post");

function createModifiedHomePostObject(posts) {
  const modifiedPosts = posts.map((post) => {
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
  return modifiedPosts;
}

module.exports.createModifiedHomePostObject = createModifiedHomePostObject;
