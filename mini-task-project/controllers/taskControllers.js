const fs = require('fs');
const Task = require('../models/taskModel.js');
const { FluentMongoose } = require('../utils/queryBuilders')
const AppErrorTrigger = require('../utils/AppErrorTrigger.js')
const {errorCatchingLayer} = require('../utils/helpers.js');
const factory = require('./factory.js')

// Handlers V2
exports.getTasks = errorCatchingLayer(async (req, res, next) => {
  // get total dicuments
  let totalCount = await Task.countDocuments();

  // tasks = await query;
  const tasks = await new FluentMongoose(Task.find(), req.query)
                        .filter()
                        .sortBy()
                        .fieldLimit()
                        .paginate(totalCount)
                        .query;
  // success
  res.status(200).json({
    status : 'success',
    tasks: tasks,
  });
});

exports.addTask = factory.createOne(Task,'task');

exports.getTask = factory.readOne(Task, 'task','responsible');

exports.updateTask = factory.updateOne(Task,'task');

exports.deleteTask = factory.deleteOne(Task,'task');

exports.taskStats = errorCatchingLayer(async (req, res, next) => {

  // AGGREGATION PIPELINE
  // a way to iterate through a collection documents in order to perform some computing operation 'avg ,sort, filterring'

    const stats = await Task.aggregate([
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
