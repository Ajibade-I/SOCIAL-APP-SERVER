module.exports = (req, res, next) => {
  console.log("API Access log : ", req.path);
  next();
};
