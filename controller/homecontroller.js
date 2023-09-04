//@Method: GET user/home
//@Desc: Homepage
//@Acces: Public

const Home = async (req, res) => {
  res.json({ msg: "WELCOME TO THE COMMUNITY" });
};

module.exports = Home;
