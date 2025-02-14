const pool = require('../config/db');
const operationsQueries = require('../models/standsOperationsQueries');
const {executeQuery,retriever} = require('../utils/queryingHelpers')



// Helper Functions - Middlewares
exports.showStands = (req,res) => {

  const {error,result} = executeQuery(operationsQueries.allStands,retriever);
}

exports.showStand = (req,res) => {

  let numero = req.params.numero;

  const {error,result} = executeQuery(operationsQueries.oneStand,[numero],retriever);
}

exports.insertStand = (req,res) => {

  let data = req.body.data.values;

  const {error,result} = executeQuery(operationsQueries.insertStand,[...data],retriever);
}

exports.deleteStand = (req,res) => {

  let numero = req.params.numero;

  const {error,result} = executeQuery(operationsQueries.deleteStand,[numero],retriever);
}

exports.updateStand = (req,res) => {

  let data = req.body.data.values;

  const {error,result} = executeQuery(operationsQueries.updateStand,[...data],retriever);
}
