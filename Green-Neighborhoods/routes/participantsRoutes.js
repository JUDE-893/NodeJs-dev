const express = require('express');
const controllers = require('../controllers/participantController');

const router = express.Router();

// routes handling
router.route('/participants')
  .get(controllers.showParticipants);

router.route('/participants/:id')
  .get(controllers.showParticipant);

router.route('/participant')
  .post(controllers.insertParticipant);

router.route('/participants/participant')
  .patch(controllers.updateParticipant);

router.route('/participants/participant/:id')
  .delete(controllers.deleteParticipant);

// export the router
module.exports = router;
