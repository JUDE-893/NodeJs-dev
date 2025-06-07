const mongoose = require('mongoose');
const slugify = require('slugify');
const uniqueValidator = require('mongoose-unique-validator');

// define a collection' document schema
const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "the tour name is required"],
    unique: [true, "a tour name must be unique"],
    maxlength: [40, 'the tour name must be less than 40 character long'],
    minlength: [10, 'the tour name must be more than 10 character long'],
    trim: true,
  },
  // validate: [func <Boolean>, 'custom messagge'], shorthand expression
  // slug: String,
  duration: {
    required: [true, "a tour duration is required"],
    type: Number
  },
  maxGroupSize: {
    required: [true, "a tour must have a group size"],
    type: Number,
    max:20,
    min:3
  },
  difficulty: {
    required: [true, "a tour must have a difficulty"],
    enum: {
      values: ['easy', 'medium', 'difficult'],
      message: "the difficulty must be eather easy, medium or difficult"
    },
    type: String
  },
  ratingsAvg: {
    type: Number,
    max:[5, "the average rating should less than 5"],
    min:[1, "the average rating should greater than 1"]
  },
  ratingsQuantity: {
    type: Number,
  },
  price: {
    type: Number,
    required: [true, "the tour price is required"]
  },
  discount: {
    type: Number,
    validate: {
      validator: function(val) {
        return this.price > val;
      },
      message: "the discount cannot be greater than the price"
    }
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
  startDates: [Date],
  startLocation: {
   type: {
     type: String,
     enum: ['Point'],
     default: 'Point'
   },
   coordinates: [Number],
   address: String,
   description: String
 },
  locations: [
   {
   type: {
     type: String,
     enum: ['Point'],
     default: 'Point'
   },
   coordinates: [Number],
   address: String,
   description: String,
   day: Number
 }
],
  guides: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    }
  ]
},
 {
   toJSON: {virtuals:true},
   toObject: {virtuals:true}
}
);

// setting db index: a common pattern to improve daata base read performances by storing common queried fields in b-tree structure for perforamnt search mechanism
// avoiding scaning all documents for matching field' values
tourSchema.index({price: 1, ratingsAverage:-1})
tourSchema.index({ startLocation: '2dsphere' });

tourSchema.plugin(uniqueValidator, { message: '{PATH} must be unique.' });

/// define a virtual properties

/* num week duration fields*/
tourSchema.virtual('durationWeeks').get(function() {
  return this.duration/7;
});

/* create a virtual referenced field */
tourSchema.virtual('reviews', {
  foreignField: 'tour',
  localField: '_id',
  ref: 'Review'
})

// Middlewares | Hooks that get triggered after of before some operation (save,delete,update ..)
tourSchema.pre('save', function(next) {
  // this.slug = slugify(this.name, {lower:true});
  next();
});

// Middlewares | Hooks that get triggered after of before some operation (save,delete,update ..)
tourSchema.pre(/^find/, function(next) {
  this.populate({path: 'guides', select: '-__v -PasswordResetTokenExpiresAt -passwordResetToken -passwordUpdatedAt -password'});
  next();
});




// create a collection' document model
const Tour = mongoose.model('Tour',tourSchema);

module.exports = Tour;


//
//
// // model declaration : startLocation: {
// startLocation: {
//  type: {
//    type: String,
//    enum: ['Point'],
//    default: 'Point'
//  },
//  coordiantes: [Number],
//  address: String,
//  description: String
// },
//
// // actual data :
// "startLocation": {
// "description": "Miami, USA",
// "type": "Point",
// "coordinates": [-80.185942, 25.774772],
// "address": "301 Biscayne Blvd, Miami, FL 33132, USA"
// },
// //  inserted data
// startLocation: { type: 'Point', coordiantes: [] }
