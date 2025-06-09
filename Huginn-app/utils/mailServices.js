import nodemailer from 'nodemailer';

const transporter = () => nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: +(process.env.MAIL_PORT),
  secure: process.env.MAIL_PORT === '465',
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
  // Add these security settings
  tls: {
    ciphers: 'SSLv3',
    rejectUnauthorized: false
  }
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
export const sendMail = async (conf) => {console.log(process.env.MAIL_PASSWORD, process.env.MAIL_USERNAME,process.env.MAIL_PORT,process.env.MAIL_HOST,);let i = await transporter().sendMail(conf); console.log(i);}
