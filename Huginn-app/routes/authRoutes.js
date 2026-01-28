import express from 'express';
import {register, login, forgotPassword, resetPassword, activateAccount, reSendVerificationToken, getUserFromToken}  from '../controllers/authController.js';

const router = express.Router();

router.route('/register')
      .post(register);

router.route('/login')
      .post(login);

router.route('/forgot-password')
      .post(forgotPassword);

router.route('/resetPassword/:resetToken')
      .post(resetPassword);

router.route('/verify-Account/:token')
      .get(activateAccount);

router.route('/resend-verification-mail')
      .get(async (req, res, next) => {
            const token = (req.headers.authorization).split(' ')[1];
            const user = await getUserFromToken(token);
            req.user = user;
            next();

      }, reSendVerificationToken);


export default router
