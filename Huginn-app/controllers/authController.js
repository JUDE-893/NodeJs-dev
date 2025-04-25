import {errorCatchingLayer, signJWT, setJwtCookie} from '../utils/helpers.js';
import AppError from '../utils/AppError.js';
import User from '../models/userModel.js'


export const register = errorCatchingLayer(async (req,res,next) => {

  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  // generate token
  let token = signJWT(user.id);

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
  let token = signJWT(user.id);

  // set token cookie
  setJwtCookie(res, token)

  return res.status(201).json({status: 'success', token, user})
})
