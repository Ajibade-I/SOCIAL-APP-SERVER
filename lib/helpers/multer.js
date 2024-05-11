const multer = require("multer");

//Multer config for handling file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    //directory where file will be stored
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    //generate uinque file name
    cb(null, file.fieldname + "-" + Date.now());
  },
});

const upload = multer({ storage: storage });

module.exports = upload;
