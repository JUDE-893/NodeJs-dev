const express = require('express');
const authController = require('../controllers/authControllers');

const router = express.Router();

// authentication & register routes
router.route('/login').post(authController.login);
router.route('/register').post(authController.register);
// password resetting
router.route('/forgot-password').post(authController.forgotPassword);
router.route('/password-reset/:token').post(authController.resetPassword);

module.exports = router
