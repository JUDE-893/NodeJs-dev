import express from 'express';
import { protect }  from '../controllers/authController.js';
import { createMessage, getMessages }
            from '../controllers/messageController.js';
import { protectConversation, isActiveConversation }
            from '../controllers/conversationController.js';

const router = express.Router({mergeParams: true});



/* MESSAGES HANDLERS */

router.use(protect, protectConversation)

router.route(`/`)
  .get(getMessages);

router.use(isActiveConversation)

router.route(`/send`)
  .post(createMessage);


export default router
