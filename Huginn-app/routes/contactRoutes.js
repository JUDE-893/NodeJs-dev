import express from 'express';
import { protect }  from '../controllers/authController.js';
import { inviteContact, responseInvitation, cancelInvitation, getInvitations,
         getUserRelations}
            from '../controllers/contactController.js';

const router = express.Router();

router.use(protect)

/* RELATIONSHIPS HANDLERS */
router.route('/relations')
.get(getUserRelations);


/* INVITATION HANDLERS */

router.route('/invitions')
      .get(getInvitations);

router.route('/invite')
      .post(inviteContact);

router.route('/invite/respond')
      .patch(responseInvitation);

router.route('/invite/cancel/:id')
      .delete(cancelInvitation);

export default router
