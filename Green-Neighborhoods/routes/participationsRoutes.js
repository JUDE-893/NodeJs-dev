const express = require('express');
const controllers = require('../controllers/participationsController');

const router = express.Router();

// routes handling
router.route('/participations')
  .get(controllers.showParticipations);

router.route('/participations/:id')
  .get(controllers.showParticipation);

router.route('/participation')
  .post(controllers.insertParticipation);

router.route('/participations/participation')
  .patch(controllers.updateParticipation);

router.route('/participations/participation/:id')
  .delete(controllers.deleteParticipation);

// export the router
module.exports = router;
