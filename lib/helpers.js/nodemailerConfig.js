const host = process.env.SMTP_HOST;
const port = process.env.SMTP_PORT;
const userEmail = process.env.SMTP_MAIL;
const pass = process.env.SMTP_PASSWORD;

module.exports = {
  host,
  port,
  auth: {
    user: userEmail,
    pass,
  },
};
