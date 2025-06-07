const User = require('../models/userModel.js');
const AppErrorTrigger = require('../utils/AppErrorTrigger.js');
const factory = require('./factory.js')

const {signJwt, errorCatchingLayer, filterObject} = require('../utils/helpers.js');

// Handlers
exports.getUser = errorCatchingLayer(async(req,res,next) => {
  let id = req.params.id;

  const user = await User.findById(id, req.body);

  if (!user) {
    return next(new AppErrorTrigger('Cannot find user with that id',404));
  }
  return res.status(201).json({status:"success",user});
})

exports.getUsers = factory.readOne('User', 'user');

exports.userIdInject = errorCatchingLayer( async(req,res,next) => {
  req.params.id = req.user._id;
  next();
})

exports.addUser = errorCatchingLayer( async(req,res) => {

  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm
  });

  const jwToken = signJwt(user._id);
  // res.cookie('_csrf',req.csrfToken(), {
  //   exipres: new Date(Date.now()+process.env.REQUEST_TIMEOUT*1000),
  //   httpOnly: process.env.CSRF_HTTPONLY === 'true',
  //   sameSite: process.env.CSRF_SAMESITE,
  //   secure: process.env.NODE_ENV === 'production'
  // })
  return res.status(201).json({status: 'success', user: user,jwt:jwToken});
})

exports.updateUserPassword = errorCatchingLayer(async(req,res,next) => {
  let id = req.user.id;

  let user = await User.findById(id).select('+password');

  if (!user) {
    return next(new AppErrorTrigger('Cannot find user with that id',404));
  }

  // validate the password updating
  if(req.body?.password) {
    // check for the old password existing
    if (!req.body?.oldPassword) return next(new AppErrorTrigger('Can\'t update the password. Please provide the previous one',401));
    // check if the old password value is correct

    const correct = await user.correctPassword(user.password,req.body.oldPassword);
    if(!correct) {
      return next(new AppErrorTrigger('Incorrect old password value', 401));
    }
  }

  // merge the user object with the payload data
  Object.assign(user,payload);

  await user.save()

  const jwToken = signJwt(user._id);

  return res.status(200).json({status: 'success', user: user,jwt:jwToken});
})

exports.updateUser = errorCatchingLayer(async(req,res,next) => {
  let id = req.user.id;

  // validate the password updating
  if(req.body?.password || req.body?.passwordConfirm) {
      return next(new AppErrorTrigger('this endpoint is not listening for password updates. Please connect to PATCH /users/password-update/:userId'));
  }

  // merge the user object with the payload data
  let payload = filterObject(req.body, 'name', 'email');

  const user = await User.findByIdAndUpdate(id, payload, {new:true, runValidators: true});

  if (!user) {
    return next(new AppErrorTrigger('Cannot find user with that id',404));
  }
  return res.status(200).json({status: 'success', user: user});
})

exports.deleteUser = errorCatchingLayer(async(req,res,next) => {
  let id = req.user.id;

  const user = await User.findByIdAndUpdate(id, {active:false},{new:true, runValidators: true});

  if (!user) {
    return next(new AppErrorTrigger('Cannot find user with that id',404));
  }
  return res.status(204).json({status:"success",user});
})

exports.deleteImmidiatly = factory.deleteOne('User', 'user')
