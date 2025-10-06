import mysql from 'mysql2/promise';

const databasefivem = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME_FIVEM,
});

export default databasefivem;