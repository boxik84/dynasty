import { betterAuth } from "better-auth";
import mysql from "mysql2/promise";

// Create MySQL connection pool
const pool = mysql.createPool({
  uri: process.env.DATABASE_URL,
});

export const auth = betterAuth({
  database: {
    provider: "mysql",
    pool: pool,
  },
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    // Můžeš přidat Google, GitHub, etc. později
  },
});
