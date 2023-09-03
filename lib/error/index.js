const BadRequestError = require("./bad-request-error");
const CustomApiError = require("./custom-api-error");
const NotFoundError = require("./not-found-error");
const Unauthenticated = require("./unauthenticated");
const Unauthorized = require("./unauthorized-error");

module.exports = {
  BadRequestError,
  NotFoundError,
  Unauthenticated,
  Unauthorized,
  CustomApiError,
};
