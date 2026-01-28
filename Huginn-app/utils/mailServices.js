import nodemailer from 'nodemailer';

const transporter = () => nodemailer.createTransport({
  host: process.env.MAIL_HOST || 'smtp-relay.brevo.com',
  port: +(process.env.MAIL_PORT || 587),
  secure: process.env.MAIL_PORT === '465',
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
  // Remove insecure TLS settings
});

console.log(process.env.MAIL_PASSWORD, process.env.MAIL_USERNAME,process.env.MAIL_PORT,process.env.MAIL_HOST,);
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
export const sendMail = async (conf) => {
  try {
    const info = await transporter().sendMail({
      from: process.env.MAIL_FROM || process.env.MAIL_USERNAME,
      ...conf,
    });
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};