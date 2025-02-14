
// query that select all users
exports.allStands = `
  SELECT * FROM stands
`;

// query that select a single Stand by numero
exports.oneStand = `
  SELECT * FROM stands WHERE numero = ?;
`;

// query that update a  a single Stand record by numero
exports.updateStand = `
  UPDATE stands SET title= ?, date_start= ?, date_end= ?, address= ? where numero = ?;
`;

//query that insert a new record to the stands table
exports.insertStand = `
  INSERT INTO stands(title,date_start,date_end,address) ?
`;

// query that delete Stand record by numero
exports.deleteStand = `
  DELETE FROM stands WHERE numero = ?;
`;


//// Partial Queries

// [Filters]

/*weeks & months*/
exports.thisWeek = `
  WHERE WEEK(date_start) = WEEK(CURRENT_DATE) OR WEEK(date_end) = WEEK(CURRENT_DATE)
`;
exports.nextWeek = `
  WHERE WEEK(date_start) = WEEK(CURRENT_DATE)+1 OR WEEK(date_end) = WEEK(CURRENT_DATE)+1
`;
exports.thisMonth = `
  WHERE MONTH(date_start) = MONTH(CURRENT_DATE) OR MONTH(date_end) = MONTH(CURRENT_DATE)
`;
exports.nextMonth = `
  WHERE MONTH(date_start) = MONTH(CURRENT_DATE)+1 OR MONTH(date_end) = MONTH(CURRENT_DATE)+1
`;

/*seasons*/
exports.springTime = `
  WHERE MONTH(date_column) IN (3, 4, 5)
`;
exports.summerTime = `
  WHERE MONTH(date_column) IN (6, 7, 8)
`;
exports.fallTime = `
  WHERE MONTH(date_column) IN (9, 10, 11)
`;
exports.winterTime = `
  WHERE MONTH(date_column) IN (12, 1, 2)
`;

// [order BY]
exports.orderBY = `ORDER BY `;

// [ORDER]
/* exports.order = `ASC`;*/

// [LIMITE]
exports.limite = `LIMIT `;
