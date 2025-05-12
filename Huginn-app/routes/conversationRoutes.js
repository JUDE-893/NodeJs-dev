import express from 'express';
import { protect }  from '../controllers/authController.js';
import { createConversation, getConversations }
            from '../controllers/conversationController.js';

const router = express.Router();

router.use(protect)

/* CONVERSATION HANDLERS */

router.route('/')
.get(getConversations);

router.route('/new/:rel_id')
.get(createConversation);

export default router
