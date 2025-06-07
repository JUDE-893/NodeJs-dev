const crypto = require('crypto');
const User = require('../models/userModel.js');
const AppErrorTrigger = require('../utils/AppErrorTrigger.js');
const sendEmail = require('../utils/emailservices.js');
const {signJwt, errorCatchingLayer,verifyJwt} = require('../utils/helpers.js');

// Handlers

exports.register = errorCatchingLayer( async(req,res) => {

  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordUpdatedAt: req.body.passwordUpdatedAt,
    role: req.body.role
  });

  const jwToken = signJwt(user._id);

  return res.status(201).json({status: 'success', user: user, jwt: jwToken});
})

exports.login = errorCatchingLayer(async(req,res,next) => {

  const {email,password} = req.body;

  // check if the user credantial are existing
  if (!email || !password) {
    return next(new AppErrorTrigger('Please provide the email and password',401));
  }

  // retrieve record with specified email
  const user = await User.findOne({email}).select('+password');

  // check for
  if (!user) {
    return next(new AppErrorTrigger('Invalid email address or password',401));
  };

  const correct = await user.correctPassword(user.password,password);

  if (!correct ) {
    return next(new AppErrorTrigger('Invalid email address or password',401));
  }
  const jwToken = signJwt(user._id);
  return res.status(201).json({status:"success",jwt: jwToken});
})

exports.protect = errorCatchingLayer(async(req,res,next) => {

  // // retrieve the jwt
  // if (!req.headers.authorization && req.headers.authorization?.startsWith('Bearier')) {
  //   return next(new AppErrorTrigger('Unauthorized access! Login required', 401));
  // }
  // let token = req.headers.authorization.split(' ')[1];
  //
  // // verify the jwt
  // const result = await verifyJwt(token);
  //
  //
  // // verify the user
  // let user = await User.findById(result.id);
  //
  // if (!user) {
  //   return next(new AppErrorTrigger('The user with this token is no longer exists. Please log in again', 401));
  // }
  //
  // // verify password update
  // const outDatedToken = user.isOutDatedToken(result.iat);
  //
  // if (outDatedToken) return next(new AppErrorTrigger('This account password May be updated. Please login again',401))

  const user = await User.find();
  console.log('user::::',user);
  user[0].role='user';
  // ALLOWED !
  req.user = user[0];
  next()
})

exports.restrict = (...roles) => {
  return (req,res,next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppErrorTrigger('This account roles in unauthorized to perform this operation',403));
    }
    return next();
  }
}

exports.forgotPassword = errorCatchingLayer(async(req,res,next) => {
  // check the user
  const user = await User.findOne({email: req.body.email});

  if (!user) {
    return next(new AppErrorTrigger('Incorrect email address. Please provide the email address you are registered with'));
  };
  // generate the token
  const token = await user.createPassordResetToken();
  user.save({validateBeforeSave: false});

  // send email
  let url = `${req.protocol}://${req.get('host')}/api/auth/password-reset/${token}`
  let text = `<p>You did submited a request for resetting your <strong>Natour</strong> account using this email address : ${user.email}</p>
  <br/> To process please click the confirmation <a href='${url}'>link</a><br/>
  if you did not submit ant reset password request, you can safely ignore this email.
  `
  await sendEmail({email:user.email, subject: 'Password reset token (valide for 10 min).', text, html:text})
  return res.status(201).json({status: 'success', message: "verification email with a token is sent"})
});

exports.resetPassword = errorCatchingLayer( async(req,res,next) => {
  // check if the user with token exists and token is not outdated
  const cryptedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({passwordResetToken: cryptedToken, PasswordResetTokenExpiresAt: {$gte: Date.now()}});

  if (!user) {
    return next(new AppErrorTrigger('Invalid reset token. Please try again'),400);
  }

  // reset the password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.PasswordResetTokenExpiresAt = undefined;

  // update the updateAt field (middleware)
  // SAVE
  await user.save();
  //generate the jwt
  const jwToken = signJwt(user._id);
  return res.status(201).json({status:"success",jwt: jwToken});

});
