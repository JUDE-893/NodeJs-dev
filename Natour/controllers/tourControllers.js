const fs = require('fs');
const Tour = require('../models/TourModel.js');
const { FluentMongoose } = require('../utils/queryBuilders')

// Handlers
exports.getTours = async (req,res) => {
  try {
    console.log('rr',req.query);
    // get total dicuments
    let totalCount = await Tour.countDocuments();

    // tours = await query;
    const tours = await new FluentMongoose(Tour.find(), req.query)
                          .filter()
                          .sortBy()
                          .fieldLimit()
                          .paginate(totalCount)
                          .query;
    // success
    res.status(200).json({
      status : 'success',
      tours: tours,
    });

  } catch (e) {
    // fails
    res.status(400).json({
      status : 'fails',
      message: e.message,
    });
  }
}

exports.addTour = async (req,res) => {
  try {
    console.log(req.body);
    const data = await Tour.create(req.body);
    res.status(200).json({status:'success',tour:data});

  } catch (e) {
    res.status(400).json({status:'fails', message:e.message});
  }
}

exports.getTour = async (req,res) => {

  try {
    const tour = await Tour.findById(req.params.id);
    res.status(200).json({status:'success',tour: tour});
  } catch (e) {
    res.status(404).json({status:'fails',message: e.message});
  }
}

exports.updateTour = async (req,res) => {

  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {new: true,runValidators:true});
    res.status(200).json({status:'success',tour: tour});
  } catch (e) {
    res.status(400).json({status:'fails',message: e.message});
  }
}

exports.deleteTour = async (req,res) => {
  console.log("settout",req.params.id);
  try {
    const tour = await Tour.findByIdAndDelete(req.params.id,{runValidators:true});
    res.status(200).json({status:'success',tour: tour});
  } catch (e) {
    res.status(400).json({status:'fails',message: e.message});
  }
}

exports.topToursMiddle = (req,res,next) => {
  req.query.sortBy = "-ratingsAvg price";
  req.query.limit = "5";
  req.query.page = "1";
  next();
}


// exports.checkID = (req,res,next,id) => {
//   let tour = tours.find( (us) => us._id === id);
//   // return the tour
//   if (tour) {
//     req.tour = tour;
//     next();
//   }else{
//     res.status(404).json({status:'fails',message :'invalid IDD'})
//     return null;
//   }
// }
