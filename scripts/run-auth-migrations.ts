import { config } from "dotenv";

config({ path: ".env.local" });

async function main() {
  const { authDatabasePool, waitForAuthMigrations } = await import("../lib/auth");
  try {
    await waitForAuthMigrations();
    console.log("Better Auth migrations completed");
  } catch (error) {
    console.error("Better Auth migrations failed");
    console.error(error);
    process.exitCode = 1;
  } finally {
    try {
      await authDatabasePool.end();
    } catch (closeError) {
      console.error("Failed to close MySQL pool", closeError);
      process.exitCode = 1;
    }
  }
}

void main();
