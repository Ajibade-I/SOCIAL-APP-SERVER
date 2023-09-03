const { StatusCodes } = require("http-status-codes");
const CustomApiError = require("./custom-api-error");

class Unauthenticated extends CustomApiError {
  constructor(messsage) {
    super(message);
    this.statuscode = StatusCodes.UNAUTHORIZED;
  }
}
module.exports = Unauthenticated;
