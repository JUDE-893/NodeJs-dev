const pool = require('../config/db');
const operationsQueries = require('../models/participationsOperationsQueries');
const {executeQuery,retriever} = require('../utils/queryingHelpers')



// Helper Functions - Middlewares
exports.showParticipations = (req,res) => {

  const {error,result} = executeQuery(operationsQueries.allParticipations,retriever);
}

exports.showParticipation = (req,res) => {

  let id = req.params.id;

  const {error,result} = executeQuery(operationsQueries.oneParticipation,[id],retriever);
}

exports.insertParticipation = (req,res) => {

  let data = req.body.data.values;

  const {error,result} = executeQuery(operationsQueries.insertParticipation,[...data],retriever);
}

exports.deleteParticipation = (req,res) => {

  let id = req.params.id;

  const {error,result} = executeQuery(operationsQueries.deleteParticipation,[id],retriever);
}

exports.updateParticipation = (req,res) => {

  let data = req.body.data.values;

  const {error,result} = executeQuery(operationsQueries.updateParticipation,[...data],retriever);
}
