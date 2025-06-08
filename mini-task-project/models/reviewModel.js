const mongoose = require('mongoose');
const Task = require('./TaskModel.js');

const reviewShema = new mongoose.Schema({
  review: {
    type: String,
    min: [3, 'a review must be more than 3 character long'],
    required: [true, 'a review is required'],
  },
  rating: {
    type: Number,
    min: [1, 'min review rating is 1'],
    max: [5, 'max review rating is 5'],
    default: 1
  },
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'a review must belong to a user']
  },
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tour',
    required: [true, 'a review must belong to a tour']
  },
  createdAt: {
    type: Date,
    default: Date.now()
  }
},{
  toJSON: {virtual: true},
  toObject: {virtual: true}
})

// create an comlexe unique index for tour+author
reviewShema.index({tour: 1 , author: 1}, {unique:true})

// create static method for updating a tour rating data on review update (create/delete/update)
reviewShema.statics.updateTourRating = async function(tourId) {
  // this points to the model
  const data = await this.aggregate([
    {$match: {tour: tourId}},
    {$group: {
      _id: '$tour',
      totalCount: {$sum: 1},
      avgRat: {$avg: '$rating'}
    }}
  ]);
  console.log('updated rating: ', data);
  await Tour.findByIdAndUpdate(tourId,{
    ratingsQuantity: data[0].totalCount,
    ratingsAvg: data[0].avgRat
  })

}


reviewShema.pre(/^find/, function(next) {
  this.populate({path: 'author', select: '-__v -PasswordResetTokenExpiresAt -passwordResetToken -passwordUpdatedAt -password'})
  // .populate({path: 'tour', select: 'ratingsAvg name difficulty'});
  next()
})

// tour rating update on review creation
reviewShema.post('save', async function(doc, next) {
  await this.constructor.updateTourRating(this.tour);
  next()
})

// execute the query and inject the doc to the this var
reviewShema.post(/^findOneAnd/, async function(next) {
  // execute the query
  this.rvw = await this.findOne()
  next()
})

reviewShema.post(/^findOneAnd/, async function(next) {
  console.log(this.rvw);
  await this.constructor.updateTourRating(this.rvw._id);
  next()
})

const Review = mongoose.model('Review',reviewShema)

module.exports = Review;
