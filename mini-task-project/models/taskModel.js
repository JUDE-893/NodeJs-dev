const mongoose = require('mongoose');
const slugify = require('slugify');
const uniqueValidator = require('mongoose-unique-validator');

// define a collection' document schema
const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "the task title is required"],
    unique: [true, "a task title must be unique"],
    maxlength: [40, 'the task title must be less than 40 character long'],
    minlength: [10, 'the task title must be more than 10 character long'],
    trim: true,
  },
  duration: Number,
  /*durationWeeks: Number,*/
  maxGroupSize: {

    type: Number,
    max: 6,
    min: 1,
    default: 1
  },
  difficulty: {
    enum: {
      values: ['easy', 'medium', 'difficult'],
      message: "the difficulty must be eather easy, medium or difficult"
    },
    type: String,
    default: 'medium'
  },
  priority: {
    enum: {
      values: ['low', 'medium', 'high'],
      message: "the priority must be eather low, medium or high"
    },
    type: String,
    default: 'medium'
  },
  summary: {

    type: String,
    trim: true       /*"   hi there   from    ..."*/
  },
  description: {
    type: String,
    trim: true       /*"   hi there   from    ..."*/
  },
  startDate: {
   type: Date,
   default: Date.now(),
   select: false
 },
  finishDate: {
   type: Date,
   default: Date.now(),
   select: false
 },
  responsible: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    }
  ],
  createdAt: {
   type: Date,
   default: Date.now(),
   select: false
 }
},
 {
   toJSON: {virtuals:true},
   toObject: {virtuals:true}
}
);

// unique field validator
taskSchema.plugin(uniqueValidator, { message: '{PATH} must be unique.' });

/// define a virtual properties

/* num week duration fields*/
taskSchema.virtual('durationDays').get(function() {
  return this.duration/(24*60*60*1000);
});

// Middlewares | Hooks that get triggered after of before some operation (save,delete,update ..)
taskSchema.pre('save', function(next) {
  // this.slug = slugify(this.title, {lower:true});
  this.duration = this.finishDate - this.startDate;
  next();
});

// Middlewares | Hooks that get triggered after of before some operation (save,delete,update ..)
taskSchema.pre(/^find/, function(next) {
  this.populate({path: 'responsible', select: '-__v -PasswordResetTokenExpiresAt -passwordResetToken -passwordUpdatedAt -password'});
  next();
});




// create a collection' document model
const Task = mongoose.models.Task || mongoose.model('Task',taskSchema);

module.exports = Task;
