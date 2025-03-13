const express = require('express');
const tourControllers = require('../controllers/tourControllers');


// creating router instance or sub-app that is use as a specific domain for specefic urls
// it is create to modelize the app routes
const router =  express.Router();

// router.param('id',tourControllers.checkID)

// tours
router.route('')
  .get(tourControllers.getTours);
router.route('')
  .post(tourControllers.addTour);  //add a tour

router.route('/top-5-tours')
  .get(tourControllers.topToursMiddle, tourControllers.getTours);

router.route('/tours-stats')
  .get(tourControllers.tourStats);

router.route('/monthly-stats/:year')
  .get(tourControllers.monthlyStats);

router.route('/:id')
  .patch(tourControllers.updateTour);   // update a tour
router.route('/:id') // get a tour
   .get(tourControllers.getTour);
router.route('/:id')
  .delete(tourControllers.deleteTour);  // delete a tour


module.exports = router;
