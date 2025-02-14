
// query that select all users
exports.allParticipations = `
  SELECT * FROM participations;
`;

// query that select a single Participation by numero
exports.oneParticipation = `
  SELECT * FROM participations where numero = ?;
`;

// query that update a  a single Participation record by numero
exports.updateParticipation = `
  UPDATE participations SET siege_size= ? where numero = ?;
`;

//query that insert a new record to the participations table
exports.insertParticipation = `
  INSERT INTO participations(siege_size,code_participant,num_stand) ?
`;

// query that delete Participation record by numero
exports.deleteParticipation = `
  DELETE FROM participations WHERE numero = ?;
`;
   
