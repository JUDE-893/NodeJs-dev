const express = require('express');
const reviewsController = require('../controllers/reviewsController');
const authControllers = require('../controllers/authControllers');

const router = express.Router({mergeParams:true});

//protected routes
router.use(authControllers.protect)
router.route('').get(reviewsController.getReviews);

//restricted routes to the user routes
router.use(authControllers.restrict('user'))
router.route('').post(reviewsController.prepareBody, reviewsController.createReview);
router.route('').patch(reviewsController.updateReview);
router.route('').delete(authControllers.restrict('user','admin'), reviewsController.deleteReview);

module.exports = router;
