const fs = require('fs');
const Tour = require('../models/TourModel.js');
const { FluentMongoose } = require('../utils/queryBuilders')
const AppErrorTrigger = require('../utils/AppErrorTrigger.js')

// Handlers V2
exports.topToursMiddle = (req,res,next) => {
  req.query.sortBy = "-ratingsAvg price";
  req.query.limit = "5";
  req.query.page = "1";
  next();
}

exports.getTours = errorCatcherLayer(async (req, res, next) => {
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
})

exports.addTour = errorCatcherLayer(async (req, res) => {

    const data = await Tour.create(req.body,{new: true,runValidators:true});
    console.log("data",data);
    res.status(200).json({status:'success',tour:data});
})

exports.getTour = errorCatcherLayer(async (req, res, next) => {

    const tour = await Tour.findById(req.params.id);

    if(!tour) {
      return next(new AppErrorTrigger('Cannot find tour with that id',404))
    }

    res.status(200).json({status:'success',tour: tour});
})

exports.updateTour = errorCatcherLayer(async (req, res, next) => {
    //  new : returns the updated object | runValidators : trigger validation on updated fields
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {new: true,runValidators:true});

    if(!tour) {
      return next(new AppErrorTrigger('Cannot find tour with that id',404))
    }

    res.status(200).json({status:'success',tour: tour});
})

exports.deleteTour = errorCatcherLayer(async (req, res, next) => {
    const tour = await Tour.findByIdAndDelete(req.params.id,{runValidators:true});

    if(!tour) {
      return next(new AppErrorTrigger('Cannot find tour with that id',404))
    }

    res.status(200).json({status:'success',tour: tour});
})

exports.tourStats = errorCatcherLayer(async (req, res, next) => {

  // AGGREGATION PIPELINE
  // a way to iterate through a collection documents in order to perform some computing operation 'avg ,sort, filterring'

    const stats = await Tour.aggregate([
      {$match: {ratingsAvg : {'$gte': 4.0}}},
      {$group: {
        _id: {$toUpper: '$difficulty'},
        totalCount: {$sum: 1},
        totalRatingQuantity : {$sum: '$ratingsQuantity'},
        ratingsAverage: {$avg : '$ratingAvg'},
        averagePrice: {$avg : '$price'},
        maxPrice: {$max: '$price'},
        minPrice: {$min: '$price'},
      }},
      {$sort: {totalCount: -1}}
    ])
    res.status(200).json({status:'success',stats: stats});
})

exports.monthlyStats = errorCatcherLayer(async (req, res, next) => {

    // unwind operator | used to destructor (or spread) a document' array property into more document ,where each field (from the array) will be included in its own respective document
    const monthlyStats = await Tour.aggregate([
      {
        $unwind : '$startDates'
      },
      {
        $match: {
                  startDates: {
                      $gte: new Date(`${year}-01-01`),
                      $lte: new Date(`${year}-12-31`)
                          }
                }
      },
      {
        $group: {
          _id: {$month: '$startDates'},
          toursTitles: {$push: '$name'},
          tourCount: {$sum: 1}
        },
      },
      {
        $sort: {tourCount: -1}
      },
      {
        $addFields: {month: '$_id'}
      },
      {
        $limit: 12
      }
    ])

    res.status(200).json({status:'success',stats: monthlyStats});
})


// HELPERS

// WRAPPER FUNCTION
// wrap each handler try{} block content, and catch any occured error in order to forward it to the global error handling middleware, in order to avoide repitition
function errorCatcherLayer(func) {
  return (req,res,next) => {
    func(req,res,next).catch((e) => next(e));
  };
}



// Handlers V1

// exports.getTours = async (req,res) => {
//     try {
//         console.log('rr',req.query);
//         // get total dicuments
//         let totalCount = await Tour.countDocuments();
//
//         // tours = await query;
//         const tours = await new FluentMongoose(Tour.find(), req.query)
//                               .filter()
//                               .sortBy()
//                               .fieldLimit()
//                               .paginate(totalCount)
//                               .query;
//         // success
//         res.status(200).json({
//             status : 'success',
//             tours: tours,
//           });
//
//         } catch (e) {
//             // fails
//             res.status(400).json({
//                 status : 'fails',
//                 message: e.message,
//               });
//             }
//           }
//
// exports.addTour = async (req,res) => {
//               try {
//                   console.log(req.body);
//                   const data = await Tour.create(req.body,{runValidators: true});
//                   res.status(200).json({status:'success',tour:data});
//
//                 } catch (e) {
//                     res.status(400).json({status:'fails', message:e.message});
//                   }
//                 }
//
// exports.getTour = async (req,res) => {
//
//                     try {
//                         const tour = await Tour.findById(req.params.id);
//                         res.status(200).json({status:'success',tour: tour});
//                       } catch (e) {
//                           res.status(404).json({status:'fails',message: e.message});
//                         }
//                       }
//
// exports.updateTour = async (req,res) => {
//
//                           try {
//                               const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {new: true,runValidators:true});
//                               res.status(200).json({status:'success',tour: tour});
//                             } catch (e) {
//                                 res.status(400).json({status:'fails',message: e.message});
//                               }
//                             }
//
// exports.deleteTour = async (req,res) => {
//                                 console.log("settout",req.params.id);
//                                 try {
//                                     const tour = await Tour.findByIdAndDelete(req.params.id,{runValidators:true});
//                                     res.status(200).json({status:'success',tour: tour});
//                                   } catch (e) {
//                                       res.status(400).json({status:'fails',message: e.message});
//                                     }
//                                   }
//
// exports.tourStats = async (req, res) => {
//
//                                       // AGGREGATION PIPELINE
//                                       // a way to iterate through a collection documents in order to perform some computing operation 'avg ,sort, filterring'
//                                       try {
//                                           const stats = await Tour.aggregate([
//                                               {$match: {ratingsAvg : {'$gte': 4.0}}},
//                                               {$group: {
//                                                   _id: {$toUpper: '$difficulty'},
//                                                   totalCount: {$sum: 1},
//                                                   totalRatingQuantity : {$sum: '$ratingsQuantity'},
//                                                   ratingsAverage: {$avg : '$ratingAvg'},
//                                                   averagePrice: {$avg : '$price'},
//                                                   maxPrice: {$max: '$price'},
//                                                   minPrice: {$min: '$price'},
//                                                 }},
//                                                 {$sort: {totalCount: -1}}
//                                               ])
//                                               res.status(200).json({status:'success',stats: stats});
//                                             } catch (e) {
//                                                 res.status(400).json({status:'fails',message: e.message});
//                                               }
//
//                                             }
//
// exports.monthlyStats = async (req, res) => {
//                                                 try {
//                                                     const year = req.params.year;
//                                                     // unwind operator | used to destructor (or spread) a document' array property into more document ,where each field (from the array) will be included in its own respective document
//                                                     const monthlyStats = await Tour.aggregate([
//                                                         {
//                                                             $unwind : '$startDates'
//                                                           },
//                                                           {
//                                                               $match: {
//                                                                           startDates: {
//                                                                                 $gte: new Date(`${year}-01-01`),
//                                                                                 $lte: new Date(`${year}-12-31`)
//                                                                                     }
//                                                                           }
//                                                                 },
//                                                                 {
//                                                                     $group: {
//                                                                         _id: {$month: '$startDates'},
//                                                                         toursTitles: {$push: '$name'},
//                                                                         tourCount: {$sum: 1}
//                                                                       },
//                                                                     },
//                                                                     {
//                                                                         $sort: {tourCount: -1}
//                                                                       },
//                                                                       {
//                                                                           $addFields: {month: '$_id'}
//                                                                         },
//                                                                         {
//                                                                             $limit: 12
//                                                                           }
//                                                                         ])
//
//                                                                         res.status(200).json({status:'success',stats: monthlyStats});
//                                                                       } catch (e) {
//                                                                           res.status(400).json({status:'fails',message: e.message});
//                                                                         }
//                                                                       }



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
