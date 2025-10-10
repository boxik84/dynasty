import mysql from 'mysql2/promise';

const databasefivem = mysql.createPool({
  // FiveM data lives in its own database, so pull the dedicated credentials
  host: process.env.DB_HOST_FIVEM,
  user: process.env.DB_USER_FIVEM,
  password: process.env.DB_PASSWORD_FIVEM,
  database: process.env.DB_NAME_FIVEM,
});

export default databasefivem;