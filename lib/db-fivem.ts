import mysql from "mysql2/promise";

const requiredEnvVars = ["DB_HOST_FIVEM", "DB_USER_FIVEM", "DB_PASSWORD_FIVEM", "DB_NAME_FIVEM"];

requiredEnvVars.forEach((envKey) => {
  if (!process.env[envKey]) {
    throw new Error(`Missing required env var: ${envKey}`);
  }
});

const databasefivem = mysql.createPool({
  host: process.env.DB_HOST_FIVEM,
  port: Number(process.env.DB_PORT_FIVEM) || Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER_FIVEM,
  password: process.env.DB_PASSWORD_FIVEM,
  database: process.env.DB_NAME_FIVEM,
  waitForConnections: true,
  connectionLimit: 10,
});

export default databasefivem;