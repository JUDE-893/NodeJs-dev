const mysql = require('mysql');

//// create connection to a mysql local server

/* traditional connection : a new connection to be created each time this file is imported somewhere else
const connection = mysql.createConnection({   */

// pool connection: the connection is created only once the could be re-used multiple time without the need of create & destroy it again
const pool = mysql.createPool({
  user: 'root',
  password: '',
  database: 'project_mysql_db',
  host: 'localhost'
})

// connect to mysql server
/*connection.connect( (err) => {
  if (err) {
    console.log('could not connect to mysql server',error);
    return null
  }
  console.log('connected to mysql server successfuly!');
})*/

// export connection
//module.exports = connection;
module.exports = pool;
