const express = require('express');
const controllers = require('../controllers/standsController');

const router = express.Router();

// routes handling
router.route('/stands')
  .get(controllers.showStands);

router.route('/stands/:id')
  .get(controllers.showStand);

router.route('/stand')
  .post(controllers.insertStand);

router.route('/stands/stand')
  .patch(controllers.updateStand);

router.route('/stands/stand/:id')
  .delete(controllers.deleteStand);

// export the router
module.exports = router;
