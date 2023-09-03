const { StatusCodes } = require("http-status-codes");
const CustomApiError = require("./custom-api-error");

class Unauthorized extends CustomApiError {
  constructor(messsage) {
    super(message);
    this.statuscode = StatusCodes.FORBIDDEN;
  }
}
module.exports = Unauthorized;
