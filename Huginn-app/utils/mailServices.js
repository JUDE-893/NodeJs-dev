import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: process.env.MAIL_PORT === "465" ? true : false, // true for port 465, false for other ports
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
});

// function that send a email(s)
/* <conf> : configuration object
{
  from: sender address
  to: receiver (s)
  ?subject: Subject line
  ?text: plain text body
  ?html: html body
}
*/
export const sendMail = async (conf) => await transporter.sendMail(conf)
