const express = require('express');
const tourControllers = require('../controllers/tourControllers');
const authControllers = require('../controllers/authControllers');
const reviewsRouter = require('./reviewRoutes');


// creating router instance or sub-app that is use as a specific domain for specefic urls
// it is create to modelize the app routes
const router =  express.Router();

// router.param('id',tourControllers.checkID)

// nesting review routes
router.use('/:tourId/reviews', reviewsRouter);

// principal routes
// public routes
router.route('')
  .get(tourControllers.getTours);

router.route('/top-5-tours')
  .get(tourControllers.topToursMiddle, tourControllers.getTours);

router.route('/:id') // get a tour
  .get(tourControllers.getTour);

router.route('/tours-stats')
  .get(tourControllers.tourStats);

router.route('/monthly-stats/:year')
  .get(tourControllers.monthlyStats);

router.route('/tour-within/:distance/center/:latlng/unit/:unit') // select all tour within a distance from a certain point
.get(tourControllers.tourWithin)

router.route('/tour-within/distance/:latlng/unit/:unit') // select all tour distance from a certain point
.get(tourControllers.toursDistances)

// protected routes & reserved to the admin and lead guid only
router.use(authControllers.protect, authControllers.restrict("admin","lead-guide"))

router.route('/:id')
  .patch(tourControllers.updateTour);   // update a tour
   router.route('')
   .post(tourControllers.addTour);  //add a tour
router.route('/:id')
  .delete(tourControllers.deleteTour);  // delete a tour


module.exports = router;
