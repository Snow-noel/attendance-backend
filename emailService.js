const nodemailer = require("nodemailer");

const transport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const SendMail = async (to, subject, message) => {
  try {
    transport.sendMail({
      from: process.env.EMAIL_USER,
      to: to,
      subject: subject,
      html: message,
    });
    console.log("Email sent successifully");
  } catch (err) {
    console.error("error sending the Email", err);
  }
};

module.exports = SendMail;
