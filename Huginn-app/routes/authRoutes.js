import express from 'express';
import {register, login, forgotPassword, resetPassword}  from '../controllers/authController.js';

const router = express.Router();

router.route('/register')
      .post(register);

router.route('/login')
      .post(login);

router.route('/forgot-password')
      .post(forgotPassword);

router.route('/resetPassword/:resetToken')
      .post(resetPassword);


export default router
