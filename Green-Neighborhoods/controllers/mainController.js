const pool = require('../config/db');
const operationsQueries = require('../models/standsOperationsQueries');
const {executeQuery,templater} = require('../utils/queryingHelpers');

const {allStands,thisWeek,orderBY,limite} = operationsQueries;

// Helper Functions - Middlewares
exports.showLatestStands = async (req,res) => {
  const {error, result} = await executeQuery(allStands+thisWeek+orderBY+'total_reservations ASC '+limite+"6");
  templater(res,error,{latiestStands:result},'index.html')
}

exports.test = async (req,res) => {
  templater(res,null,{},'discover-farmers-story.html')
}
