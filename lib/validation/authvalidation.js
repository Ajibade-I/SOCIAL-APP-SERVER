const yup = require("yup");

const profileSchema = yup.object().shape({
  userName: yup
    .string()
    .min(2)
    .max(20)
    .required("Username is required")
    .label("Username")
    .matches(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain alphanumeric characters and underscores"
    ),
  bio: yup.string().min(3).max(250).label("Bio"),
  profileType: yup
    .string()
    .oneOf(["public", "private"], "Invalid profiletype")
    .default("public"),
});

async function validateSignup(data) {
  const schema = yup.object().shape({
    firstName: yup
      .string()
      .min(2)
      .max(50)
      .required("First name is required")
      .label("First name"),
    lastName: yup
      .string()
      .min(2)
      .max(50)
      .required("Last name is required")
      .label("Last name"),
    phoneNumber: yup
      .string()
      .min(11)
      .max(15)
      .required("Phone number is required")
      .label("Phone number"),
    profile: profileSchema,
    email: yup
      .string()
      .email("Provide a valid email")
      .required("Email is required")
      .label("Email"),
    password: yup
      .string()
      .min(10)
      .max(20)
      .required("Password is required")
      .label("password"),
  });
  try {
    const validationData = await schema.validate(data);
    return null;
  } catch (error) {
    return error?.errors[0];
  }
}

async function validateLogin(data) {
  const schema = yup.object().shape({
    email_or_userName: yup
      .string()
      .required("Email or Username is required")
      .label("Email or Username"),
    password: yup.string().required("Password is required").label("Password"),
  });
  try {
    const validationData = await schema.validate(data);
  } catch (error) {
    return error?.errors[0];
  }
}

async function validateProfileEdit(data) {
  const schema = yup.object().shape({
    userName: yup
      .string()
      .min(2)
      .max(20)
      .label("Username")
      .matches(
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain alphanumeric characters and underscores"
      ),
    bio: yup.string().min(3).max(250).label("Bio"),
    profileType: yup
      .string()
      .oneOf(["public", "private"], "Invalid profiletype")
      .default("public"),
  });
  try {
    const validateData = await schema.validate(data);
  } catch (error) {
    return error?.errors[0];
  }
}

async function validateRequestAction(data) {
  const schema = yup.object().shape({
    username: yup.string().required("Username is required").label("Username"),
    action: yup
      .string()
      .required("Action cannot be empty")
      .oneOf(
        ["accept", "decline"],
        "you can only accept or decline a friend request"
      ),
  });
  try {
    const validateData = await schema.validate(data);
  } catch (error) {
    return error?.errors[0];
  }
}

async function validateAccountEdit(data) {
  const schema = yup.object().shape({
    firstName: yup.string().min(2).max(50).label("First name"),
    lastName: yup.string().min(2).max(50).label("Last name"),
    phoneNumber: yup.string().min(11).max(15).label("Phone number"),
    password: yup
      .string()
      .min(10)
      .max(20)
      .required("Password is required")
      .label("password"),
  });

  try {
    const validateData = await schema.validate(data);
  } catch (error) {
    return error?.errors[0];
  }
}

async function validatePasswordReset(data) {
  const schema = yup.object().shape({
    oldPassword: yup
      .string()
      .required("Old password is required")
      .label("Old password"),
    newPassword: yup
      .string()
      .min(10)
      .max(20)
      .required("Password is required")
      .label("password"),
  });
  try {
    const validateData = await schema.validate(data);
  } catch (error) {
    return error?.errors[0];
  }
}

module.exports.validateSignup = validateSignup;
module.exports.validateLogin = validateLogin;
module.exports.validateProfileEdit = validateProfileEdit;
module.exports.validateAccountEdit = validateAccountEdit;
module.exports.validateRequestAction = validateRequestAction;
module.exports.validatePasswordReset = validatePasswordReset;
