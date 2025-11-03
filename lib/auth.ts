import { betterAuth } from "better-auth";
import { getMigrations } from "better-auth/db";
import { nextCookies } from "better-auth/next-js";
import { createPool } from "mysql2/promise";

const plugins = [nextCookies()];

const baseURL =
  process.env.BETTER_AUTH_URL ??
  process.env.NEXT_PUBLIC_APP_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

const databaseHost = process.env.DB_HOST;
const databaseUser = process.env.DB_USER;
const databasePassword = process.env.DB_PASSWORD;
const databaseName = process.env.DB_NAME;
const databasePort = Number(process.env.DB_PORT ?? "3306");

if (!databaseHost || !databaseUser || !databasePassword || !databaseName) {
  throw new Error("Missing MySQL connection details in environment variables");
}

const mysqlPool = createPool({
  host: databaseHost,
  port: databasePort,
  user: databaseUser,
  password: databasePassword,
  database: databaseName,
  timezone: "Z",
  waitForConnections: true,
  connectionLimit: 10,
});

export const authDatabasePool = mysqlPool;

const secret = process.env.BETTER_AUTH_SECRET ?? process.env.AUTH_SECRET;

if (!secret) {
  throw new Error("Missing BETTER_AUTH_SECRET or AUTH_SECRET environment variable");
}

export const auth = betterAuth({
  appName: "Dynasty",
  baseURL,
  secret,
  database: mysqlPool,
  emailAndPassword: {
    enabled: true,
  },
  plugins,
});

let migrationsPromise: Promise<void> | null = null;

async function runMigrationsOnce() {
  if (!migrationsPromise) {
    migrationsPromise = getMigrations(auth.options)
      .then(async ({ runMigrations }) => {
        await runMigrations();
      })
      .catch((error) => {
        migrationsPromise = null;
        throw error;
      });
  }

  return migrationsPromise;
}

void runMigrationsOnce();

export const waitForAuthMigrations = runMigrationsOnce;
