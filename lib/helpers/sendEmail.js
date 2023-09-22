const nodemailer = require("nodemailer");
const nodemailerConfig = require("./nodemailerConfig");

const userEmail = process.env.SMTP_MAIL;

const sendEmail = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport(nodemailerConfig);
  return transporter.sendMail({
    from: userEmail,
    to,
    subject,
    html,
  });
};
module.exports = sendEmail;
