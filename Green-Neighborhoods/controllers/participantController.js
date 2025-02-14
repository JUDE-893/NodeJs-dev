const pool = require('../config/db');
const operationsQueries = require('../models/participantsOperationsQueries');
const {executeQuery,retriever} = require('../utils/queryingHelpers')



// Helper Functions - Middlewares
exports.showParticipants = (req,res) => {

  const {error,result} = executeQuery(operationsQueries.allParticipants,retriever);
}

exports.showParticipant = (req,res) => {

  let id = req.params.id;

  const {error,result} = executeQuery(operationsQueries.oneParticipant,[id],retriever);
}

exports.insertParticipant = (req,res) => {

  let data = req.body.data.values;

  const {error,result} = executeQuery(operationsQueries.insertParticipant,[...data],retriever);
}

exports.deleteParticipant = (req,res) => {

  let id = req.params.id;

  const {error,result} = executeQuery(operationsQueries.deleteParticipant,[id],retriever);
}

exports.updateParticipant = (req,res) => {

  let data = req.body.data.values;

  const {error,result} = executeQuery(operationsQueries.updateParticipant,[...data],retriever);
}
