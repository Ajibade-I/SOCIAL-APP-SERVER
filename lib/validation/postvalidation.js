const yup = require("yup");
const { schema } = require("../../model/post");

async function validatePost(data) {
  const schema = yup.object().shape({
    title: yup.string().label("Title"),
    content: yup.string().required("Post cannot be empty").label("Post"),
  });
  try {
    const validationData = await schema.validate(data);
  } catch (error) {
    return error?.errors[0];
  }
}

async function validateComment(data) {
  const schema = yup.object().shape({
    message: yup
      .string()
      .max(250)
      .min(2)
      .required("Comment cannot be empty")
      .label("Comment"),
  });
  try {
    const validateData = await schema.validate(data);
  } catch (error) {
    return error?.errors[0];
  }
}

module.exports.validateComment = validateComment;
module.exports.validatePost = validatePost;
