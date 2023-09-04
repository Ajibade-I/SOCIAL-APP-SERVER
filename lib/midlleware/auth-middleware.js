const jwt = require("jsonwebtoken");
const { User } = require("../../model/User");

const isLogin = async (req, res, next) => {
  const { accesToken } = req.signedCookies;
  console.log(accesToken);

  if (accesToken) {
    try {
      const decoded = jwt.verify(accesToken, process.env.JWT_PRIVATE_KEY);
      req.user = await User.findById(decoded._id).select("-password");
      if (!req.user) {
        throw new Error("Invalid user");
      }
      next();
    } catch (error) {
      console.log(error);
      res.status(401).json({ success: true, msg: "Please login to continue" });
      return;
    }
  } else {
    res.status(401).json({ success: true, msg: "Please login to continue" });
  }
};
module.exports = isLogin;