const nodemailer = require('nodemailer');

const sendEmail = async (options) => {

  // define a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    auth: {
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD
    }
  });

  // define the mail content
  const mailOptions = {
    from: 'ayoub arif <ayoub.arif541@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.text,
    html: options.html
  }

  // send the email
  await transporter.sendMail(mailOptions);
}

module.exports = sendEmail
