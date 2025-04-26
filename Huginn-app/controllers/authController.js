import { errorCatchingLayer, signJWT, setJwtCookie } from '../utils/helpers.js';
import { sendMail } from '../utils/mailServices.js';
import { passwordResetMail } from '../template/mail.js';
import AppError from '../utils/AppError.js';
import User from '../models/userModel.js'
import crypto from 'crypto'

export const register = errorCatchingLayer(async (req,res,next) => {

  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  // generate token
  let token = signJWT(user._id);

  // set token cookie
  setJwtCookie(res, token)

  return res.status(201).json({status: 'success', token, user})
})

export const login = errorCatchingLayer(async (req,res,next) => {

  const {email, password} = req.body;

  const user = await User.findOne({email}).select('+password');

  // incorrect email
  if (!user) {
    return next(new AppError('Incorrect Email Address or Password', 404));
  }

  // incorrect Password
  if (!user.correctPassword(user.password, password)) {
    return next(new AppError('Incorrect Email Address or Password', 404));
  }

  // generate token
  let token = signJWT(user._id);

  // set token cookie
  setJwtCookie(res, token)

  return res.status(201).json({status: 'success', token, user})
})

export const forgotPassword = errorCatchingLayer(async (req, res, next) => {

  const user = await User.findById(req.body.email);

  if (!user) {
    return next( new AppError('Incorrect Email. Please provide the email used when registed', 404));
  }

  const token = user.createPasswordResetToken();
  const mailtemp = passwordResetMail({protocol: req.protocol, host: req.get('host'), mail: user.email, token})

  // send email
  await sendMail({
      from: 'ichbibarif01@gmail.com',
      to: user.email ,
      subject: "password reset verification",
      text: null,
      html: mailtemp,
    })
    .catch((e) => next(new AppError("Can't send email verification",500)))

    return res.status(200).json({status: 'success', message: 'verification mail was sent to this email address', mail: user.email})
})

export const resetPassword = errorCatchingLayer(async (req, res, next) => {

  const cryptedToken = crypto.createHash('sha256').update(req.params.resetToken).digest('hex');

  const user = await User.findOne({passwordResetToken: cryptedToken, PasswordResetTokenExpiresAt: {$gte: new Date()}})

  if (!user) {
    return next(new AppErrorTrigger('Invalid reset token. Please try again'),400);
  }

  // update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken= undefined;
  user.PasswordResetTokenExpiresAt= undefined;

  // save
  await user.save();

  // generate jwt
  const token = signJWT(user._id)

  // response
  return res.status(200).json({status: 'success', message: 'password resetted successfully', user, token})

})
