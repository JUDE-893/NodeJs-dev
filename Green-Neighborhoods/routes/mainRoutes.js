const express = require('express');
const controllers = require('../controllers/mainController');

const router = express.Router();

// routes handling
router.route('')
  .get(controllers.showLatestStands);
router.route('/test')
  .get(controllers.test);


// export the router
module.exports = router;
