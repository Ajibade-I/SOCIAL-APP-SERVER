const yup = require("yup");

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
    email: yup
      .string()
      .email("Provide a valid email")
      .required("Email is required")
      .label("Email"),
    password: yup.string().required("Password is required").label("Password"),
  });
  try {
    const validationData = await schema.validate(data);
  } catch (error) {
    return error?.errors[0];
  }
}

module.exports.validateSignup = validateSignup;
module.exports.validateLogin = validateLogin;
