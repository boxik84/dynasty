import { Kysely, MysqlDialect } from 'kysely';
import mysql from 'mysql2/promise';

function buildPool() {
  const host = process.env.DB_HOST;
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;
  const database = process.env.DB_NAME;
  const port = Number(process.env.DB_PORT ?? '3306');

  if (!host || !user || !password || !database) {
    throw new Error('Missing DB_HOST, DB_USER, DB_PASSWORD, or DB_NAME environment variables for the web database connection.');
  }

  return mysql.createPool({
    host,
    user,
    password,
    database,
    port,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });
}

declare global {
  // eslint-disable-next-line no-var
  var __webDbPool: mysql.Pool | undefined;
  // eslint-disable-next-line no-var
  var __webKysely: Kysely<unknown> | undefined;
}

const pool = globalThis.__webDbPool ?? buildPool();
if (!globalThis.__webDbPool) {
  globalThis.__webDbPool = pool;
}

const kysely = globalThis.__webKysely ?? new Kysely({
  dialect: new MysqlDialect({ pool }),
});
if (!globalThis.__webKysely) {
  globalThis.__webKysely = kysely;
}

export const webDbPool = pool;
export const webDb = kysely;

export default pool;
