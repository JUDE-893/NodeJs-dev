import express from 'express';
import { protect }  from '../controllers/authController.js';
import { createMessage, getMessages }
            from '../controllers/messageController.js';

const router = express.Router();

router.use(protect)

/* MESSAGES HANDLERS */

router.route(`/`)
.get(getMessages);

// router.route('/new/:rel_id')
// .get(createConversation);

export default router
