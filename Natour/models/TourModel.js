const mongoose = require('mongoose');

// define a collection' document schema
const tourSchema = new mongoose.Schema({
  name: {
    required: [true, "the tour name is required"],
    type: String,
    unique: [true, "a tour name must be unique"],
    trim: true
  },
  duration: {
    required: [true, "a tour duration is required"],
    type: Number
  },
  maxGroupSize: {
    required: [true, "a tour must have a group size"],
    type: Number
  },
  difficulty: {
    required: [true, "a tour must have a difficulty"],
    type: String
  },
  ratingsAvg: {
    type: Number
  },
  ratingsQuantity: {
    type: Number
  },
  price: {
    type: Number,
    required: [true, "the tour price is required"]
  },
  discount: {
    type: Number
  },
  summary: {
    required: [true, " a tour must have a description"],
    type: String,
    trim: true       /*"   hi there   from    ..."*/
  },
  description: {
    type: String,
    trim: true       /*"   hi there   from    ..."*/
  },
  imageCover: {
    type: String,
    required : [true, 'a toor must have a cover']
  },
  images: [String],
 createdAt: {
   type: Date,
   default: Date.now(),
   select: false
 },
 startDates: [Date]
},
 {
   toJSON: {virtuals:true},
   toObject: {virtuals:true}
});

// define a virtual properties
tourSchema.virtual('durationWeeks').get(function() {
  return this.duration/7;
})

// create a collection' document model
const Tour = mongoose.model('Tour',tourSchema);

module.exports = Tour;
