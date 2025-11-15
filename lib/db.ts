import mysql from "mysql2/promise";

const requiredEnvVars = ["DB_HOST", "DB_USER", "DB_PASSWORD", "DB_NAME"];

requiredEnvVars.forEach((envKey) => {
  if (!process.env[envKey]) {
    throw new Error(`Missing required env var: ${envKey}`);
  }
});

const database = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

export default database;