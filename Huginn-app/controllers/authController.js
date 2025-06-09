import { errorCatchingLayer, signJWT, setJwtCookie, verifyJWT } from '../utils/helpers.js';
import { sendMail } from '../utils/mailServices.js';
import { passwordResetMail, accountVerificationMail } from '../templates/mail.js';
import AppError from '../utils/AppError.js';
import User from '../models/userModel.js'
import crypto from 'crypto'

async function sendAccountVerificationMail(req, user) {
  const token = user.createverificationToken();
  await user.save({validateBeforeSave: false});
  const mailtemp = accountVerificationMail({protocol: req.protocol, host: req.get('host'), user, token})
  // send email
  await sendMail({
      from: `Huginn <ayoub.arif541@gmail.com>`,
      to: user.email,
      subject: "Verify Your Huginn account",
      text: 'null',
      html: mailtemp
    })
    // .catch((e) => next(new AppError("Can't send email verification",500)))
}

export const register = errorCatchingLayer(async (req,res,next) => {

  const user = await User.create({
    name: req?.body?.name,
    email: req?.body?.email,
    password: req?.body?.password,
    passwordConfirm: req?.body?.passwordConfirm,
  });

  // generate token
  let token = signJWT(user._id);

  // set token cookie
  setJwtCookie(res, token)

  await sendAccountVerificationMail(req, user);

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
  let correct = await user.correctPassword(user.password, password);
  if (!correct) {
    return next(new AppError('Incorrect Email Address or Password', 404));
  }

  // generate token
  let token = signJWT(user._id);

  // set token cookie
  // setJwtCookie(res, token)

  console.log(email, password);
  return res.status(200).json({status: 'success', token, user})
})

export const veryfyAuthToken = async (token) => {
  // valid jwt
  const rst = verifyJWT(token)

  // check for a valid user
  const user = await User.findById(rst.id).select('+password');

  if(!user) {
    let e = new AppError('Your session is likely expired. Please log in again', 401);
    e.name = 'TokenExpiredError';
    throw e;
  }

  // check for expired token
  if(user.isOutadedToken(rst.iat)){
    let e = new AppError('Your session is invalid due to password reset. Please log in again', 403);
    e.name = 'TokenExpiredError';
    throw e;
  }

  // check for unverified user
  if(!user.verifiedAt){
    let e = new AppError('Your account is yet inactive. Please check your mail inbox to verify your account', 403);
    e.name = 'UnverifiedAccountError';
    throw e;
  }

  return user
}

export const protect = errorCatchingLayer(async (req,res,next) => {
  const token = (req.headers.authorization).split(' ')[1];

  const user = await veryfyAuthToken(token);

  // success
  req.user = user;
  next()
})

export const forgotPassword = errorCatchingLayer(async (req, res, next) => {
  console.log(req.body);
  const user = await User.findOne({email: req.body.email});

  if (!user) {
    return next( new AppError('Incorrect Email. Please provide the email used when registed', 404));
  }

  const token = user.createPasswordResetToken();
  await user.save({validateBeforeSave: false});
  console.log(process.env.CLIENT_SCHEME);
  const mailtemp = passwordResetMail({mail: user.email, token})

  // send email
  await sendMail({
      from: 'ayoub.arif541@gmail.com',
      to: user.email ,
      subject: "password reset verification",
      text: null,
      html: mailtemp,
    })
    // .catch((e) => next(new AppError("Can't send email verification",500)))

  return res.status(200).json({status: 'success', message: 'verification mail was sent to this email address', mail: user.email})
})

export const resetPassword = errorCatchingLayer(async (req, res, next) => {
  const cryptedToken = crypto.createHash('sha256').update(req.params.resetToken).digest('hex');

  const user = await User.findOne({passwordResetToken: cryptedToken, PasswordResetTokenExpiresAt: {$gte: new Date()}})

  if (!user) {
    return next(new AppError('Invalid reset token. Please try again'),400);
  }

  // update password

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken= undefined;
  user.PasswordResetTokenExpiresAt= undefined;

  // save
  await user.save({validateBeforeSave: false});

  // generate jwt
  const token = signJWT(user._id)

  // response
  return res.status(200).json({status: 'success', message: 'password resetted successfully', user, token})

})

export const activateAccount = errorCatchingLayer(async (req, res, next) => {

  const cryptedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({verificationToken: cryptedToken, verificationTokenExpiresAt: {$gte: new Date()}})

  if (!user) {
    return next(new AppError('Invalid verification token. Please try again'),400);
  }

  // update password
  user.verifiedAt = Date.now();
  user.accountStatus = true;
  user.verificationToken= undefined;
  user.verificationTokenExpiresAt= undefined;

  // save
  await user.save({validateBeforeSave: false});

  const token = signJWT(user._id)

  let vertkn = token.slice(0,32)

  res.cookie("vertkn", vertkn, {
    httpOnly: true,
    secure: true,
    maxAge: 31 * 24 * 60 * 60 * 1000 // 3Od
  });

  // response
  return res.redirect(`${process.env.CLIENT_SCHEME}/chat`);

})

export const reSendVerificationToken = errorCatchingLayer(async (req, res, next) => {

  const user = req.user;

  await sendAccountVerificationMail(req, user);

  return res.status(200).json({status: 'success', message: 'verification mail was sent to this email address', mailTo: user.email})
})
