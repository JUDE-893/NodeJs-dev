const fs = require('fs');
const Tour = require('../models/TourModel.js');
const { FluentMongoose } = require('../utils/queryBuilders')
const AppErrorTrigger = require('../utils/AppErrorTrigger.js')
const {errorCatchingLayer} = require('../utils/helpers.js');
const factory = require('./factory.js')

// Handlers V2
exports.topToursMiddle = errorCatchingLayer( (req,res,next) => {
  req.query.sortBy = "-ratingsAvg price";
  req.query.limit = "5";
  req.query.page = "1";
  next();
});

exports.getTours = errorCatchingLayer(async (req, res, next) => {
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
});

exports.addTour = factory.createOne(Tour,'tour');

exports.getTour = factory.readOne(Tour, 'tour', 'reviews');

exports.updateTour = factory.updateOne(Tour,'tour');

exports.deleteTour = factory.deleteOne(Tour,'tour');

exports.tourStats = errorCatchingLayer(async (req, res, next) => {

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
});

exports.monthlyStats = errorCatchingLayer(async (req, res, next) => {

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
});

exports.tourWithin = errorCatchingLayer( async (req, res, next) => {

  const {distance, latlng, unit} = req.params;
  const [lat, lng] = latlng.split(',');
  // distance / raduis of earth (mi || km)
  // in this case it  represent the rayon of the curcle  (sphere) where we are performing the search
  // where also the lat,lng represent the center of the sphere
  const radius = unit === 'mi' ? distance / 3_963.2 : distance / 6_378.1 ;
  console.log(lat, lng, radius);
  const tours = await Tour.find({ startLocation: {
    $geoWithin: {
      $centerSphere: [ [lng, lat], radius]
    }
  }})

  return res.status(200).json({status: "sucess", count: tours.length, tours})
})

exports.toursDistances = errorCatchingLayer( async (req, res, next) => {

  const { latlng, unit} = req.params;
  const [lat, lng] = latlng.split(',');

  // turn distance value from meter to km || mi
  const factor = unit === 'km' ? 0.001 : 0.000621504039776259 ;

  const tours = await Tour.aggregate([{
    $geoNear: {
      near: { //take ageoJSON object
        type: 'Point',
        coordinates: [lng*1, lat*1]
      },
      distanceField: 'distance',
      distanceMultiplier : factor
    }
  },
  {
    $project: {
      name: 1,
      distance: 1
    }
  }])

  return res.status(200).json({status: "success", count: tours.length, tours})
})


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
