const mongoose = require('mongoose');

// define a collection' document schema
const tourSchema = new mongoose.Schema({
  name: {
    required: [true, "the tour name is required"],
    type: String,
    unique: [true, "a tour name must be unique"]
  },
  rating: {
    default: 4.5,
    type: Number
  },
  price: {
    type: Number,
    required: [true, "the tour price is required"]
  }
});

// create a collection' document model
const Tour = mongoose.model('Tour',tourSchema);

module.exports = Tour;
