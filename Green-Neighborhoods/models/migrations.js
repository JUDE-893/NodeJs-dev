const {executeQuery} = require('../utils/queryingHelpers');

// query to create  participants table
const participantTable = `
  CREATE TABLE IF NOT EXISTS participants(
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom varchar(20) NOT NULL,
    prenom varchar(20) NOT NULL,
    address varchar(100) NOT NULL,
    tel INT(9),
    profile_img varchar(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

// query to create  stands table
const standTable = `
  CREATE TABLE IF NOT EXISTS stands(
    numero INT AUTO_INCREMENT PRIMARY KEY,
    title varchar(100) NOT NULL,
    date_start TIMESTAMP,
    date_end DATETIME,
    address varchar(255),
    total_reservations INT DEFAULT 0
  );
`;

// query to create  participations table
const participationsTable = `
  CREATE TABLE IF NOT EXISTS participations(
    numero INT AUTO_INCREMENT PRIMARY KEY,
    date_reservation TIMESTAMP,
    siege_size ENUM('sm', 'md','lg'),
    code_participant INT NOT NULL,
    num_stand INT NOT NULL,
    FOREIGN KEY(code_participant) REFERENCES participants(id) ON DELETE CASCADE,
    FOREIGN KEY(num_stand) REFERENCES stands(numero) ON DELETE CASCADE
  );
`;



// executing sql queries  to create db tables
executeQuery(standTable);
executeQuery(participantTable);
executeQuery(participationsTable);
