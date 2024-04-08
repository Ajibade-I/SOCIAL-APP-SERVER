const sendEmail = require("../helpers/sendEmail");

const clientURL = process.env.CLIENT_URL;

async function sendPasswordReset({ email, token }) {
  const resetURL = `${clientURL}/auth/reset-password?token=${token}`;
  const message = ` <div> 
   <h1>Hello!</h1>
   <p>
     Click the link to reset your password : 
     <a href="${resetURL}">Reset password</a>
   </p>
   <br>
   <br>
   <p>COMMUNITY</p>
 </div>`;
  return sendEmail({
    to: email,
    subject: "Password reset",
    html: message,
  });
}
module.exports.sendPasswordReset = sendPasswordReset;
