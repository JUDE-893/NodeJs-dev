const Review = require('../models/reviewModel.js');
const AppErrorTrigger = require('../utils/AppErrorTrigger.js');
const {errorCatchingLayer} = require('../utils/helpers.js');
const factory = require('./factory.js')


exports.createReview = factory.createOne(Review,'review')

exports.prepareBody = errorCatchingLayer(async function(req,res,next) {
  console.log("server",req.body);
  req.body.tour = req.params.tourId;
  req.body.author = req.user._id;
  next()
})

exports.getReviews = errorCatchingLayer(async function(req,res,next) {
  let filter = {};
  filter = req.params?.tourId && {tour: req.params.tourId};

  const reviews = await Review.find(filter);
  return res.status(200).json({status: 'success', reviews: reviews})
})

exports.updateReview = factory.updateOne(Review,'review');

exports.deleteReview = factory.deleteOne(Review,'review');
