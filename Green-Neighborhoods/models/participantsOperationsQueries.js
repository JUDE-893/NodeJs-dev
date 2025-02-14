
// query that select all users
exports.allParticipants = `
  SELECT * FROM participants;
`;

// query that select a single participant by id
exports.oneParticipant = `
  SELECT * FROM participants where id = ?;
`;

// query that update a  a single participant record by id
exports.updateParticipant = `
  UPDATE participants SET nom= ?, prenom= ?, address= ?, tel= ? where id = ?;
`;

//query that insert a new record to the participants table
exports.insertParticipant = `
  INSERT INTO participants(nom,prenom,address,tel) ?
`;

// query that delete participant record by id
exports.deleteParticipant = `
  DELETE FROM participants WHERE id = ?;
`;
