function handleLikesMessage(likesUsernames) {
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
}
