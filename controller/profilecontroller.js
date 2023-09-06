const {
  BadRequestError,
  Unauthorized,
  NotFoundError,
} = require("../lib/error");
const validateProfile = require("../lib/validation/profilevalidation");
const { User } = require("../model/User");
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

  const userId = req.user._id;
  //   const user = await User.findById(req.user._id);
  //   if (!user) {
  //     throw new NotFoundError("User not found");
  //   }
  const profile = new Profile({
    user: userId,
    userName,
    bio,
  });
  try {
    await profile.save();
    res.status(200).json({ success: true, msg: "Profile created successfuly" });
  } catch (error) {
    console.error("Profile Error", error);
    next(error);
  }
};

//

// module.exports = createProfile;
