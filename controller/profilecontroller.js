const { BadRequestError } = require("../lib/error");
const validateProfile = require("../lib/validation/profilevalidation");
const Profile = require("../model/profile");

//@Method:POST /profile/create-profile
//@Desc: Create profile
//@Access : Private

const createProfile = async (req, res, next) => {
  const error = await validateProfile(req.body);
  if (error) {
    throw new BadRequestError(error);
  }
  const { userName, bio } = req.body;
  const usernameExists = await Profile.findOne({ userName });
  if (usernameExists) {
    throw new BadRequestError("Username is already taken");
  }
  const profile = new Profile({
    userName,
    bio,
  });
  await profile.save();
  res.status(200).json({ success: true, msg: "Profile created successfuly" });
};

module.exports = createProfile;
