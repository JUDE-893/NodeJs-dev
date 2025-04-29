import express from 'express';
import { protect }  from '../controllers/authController.js';
import { inviteContact }  from '../controllers/contactController.js';

const router = express.Router();

router.use(protect)

router.route('/invite')
      .post(inviteContact);

export default router
