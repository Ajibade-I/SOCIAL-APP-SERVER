const yup = require("yup");

async function validateProfile(data) {
  const schema = yup.object().shape({
    userName: yup
      .string()
      .min(2)
      .max(20)
      .required("Username is required")
      .label("Username"),
    bio: yup.string().min(3).max(250).label("Bio"),
  });
  try {
    const validatingdata = await schema.validate(data);
  } catch (error) {
    return error?.errors[0];
  }
}
module.exports = validateProfile;
