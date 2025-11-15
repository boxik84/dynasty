const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

const ENV_FILES = [".env.local", ".env"]; // prioritize local overrides

function loadEnv() {
    for (const file of ENV_FILES) {
        const envPath = path.resolve(process.cwd(), file);
        if (fs.existsSync(envPath)) {
            dotenv.config({ path: envPath });
            return;
        }
    }
    dotenv.config();
}

function assertEnv(keys) {
    keys.forEach((key) => {
        if (!process.env[key]) {
            throw new Error(`Missing required env var ${key} for migrations`);
        }
    });
}

async function ensureMigrationsTable(connection) {
    await connection.execute(`
        CREATE TABLE IF NOT EXISTS better_auth_migrations (
            id INT AUTO_INCREMENT PRIMARY KEY,
            filename VARCHAR(255) NOT NULL UNIQUE,
            run_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
}

async function runSingleMigration(connection, filename, filePath) {
    const [rows] = await connection.execute(
        `SELECT id FROM better_auth_migrations WHERE filename = ? LIMIT 1`,
        [filename]
    );

    if (Array.isArray(rows) && rows.length > 0) {
        console.log(`Skipping ${filename} (already applied)`);
        return;
    }

    const fileContents = fs.readFileSync(filePath, "utf8");
    const statements = fileContents
        .split(";")
        .map((stmt) => stmt.trim())
        .filter((stmt) => stmt.length > 0 && !stmt.startsWith("--"));

    if (statements.length === 0) {
        console.log(`No statements found in ${filename}, skipping.`);
        return;
    }

    console.log(`Applying ${filename} (${statements.length} statements)...`);

    await connection.beginTransaction();
    try {
        for (const statement of statements) {
            await connection.execute(statement);
        }
        await connection.execute(`INSERT INTO better_auth_migrations (filename) VALUES (?)`, [filename]);
        await connection.commit();
        console.log(`✓ ${filename} applied`);
    } catch (error) {
        await connection.rollback();
        throw new Error(`Failed applying ${filename}: ${error.message}`);
    }
}

async function runMigrations() {
    try {
        loadEnv();
        assertEnv(["DB_HOST", "DB_USER", "DB_PASSWORD", "DB_NAME"]);

        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT) || 3306,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });

        console.log("Connected to database", process.env.DB_NAME);

        await ensureMigrationsTable(connection);

        const migrationsDir = path.join(process.cwd(), "better-auth_migrations");

        if (!fs.existsSync(migrationsDir)) {
            console.warn(`No migrations directory found at ${migrationsDir}.`);
            await connection.end();
            return;
        }

        const files = fs
            .readdirSync(migrationsDir)
            .filter((file) => file.endsWith(".sql"))
            .sort();

        if (files.length === 0) {
            console.log("No SQL migrations to apply.");
            await connection.end();
            return;
        }

        for (const file of files) {
            const filePath = path.join(migrationsDir, file);
            await runSingleMigration(connection, file, filePath);
        }

        console.log("All migrations processed.");
        await connection.end();
    } catch (error) {
        console.error("Migration failed:", error.message);
        process.exit(1);
    }
}

runMigrations();