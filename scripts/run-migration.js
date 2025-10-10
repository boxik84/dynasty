const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

function loadEnvironment() {
    const projectRoot = path.join(__dirname, '..');
    const envFiles = ['.env.local', '.env'];

    for (const file of envFiles) {
        const candidate = path.join(projectRoot, file);
        if (fs.existsSync(candidate)) {
            dotenv.config({ path: candidate });
        }
    }
}

function ensureEnv(keys) {
    const missing = keys.filter((key) => !process.env[key]);
    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
}

async function runMigrations() {
    try {
        loadEnvironment();
        ensureEnv(['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME']);

        const migrationsDir = path.join(__dirname, '..', 'better-auth_migrations');
        if (!fs.existsSync(migrationsDir)) {
            console.log('No migrations directory found, nothing to run.');
            return;
        }

        const migrationFiles = fs
            .readdirSync(migrationsDir)
            .filter((file) => file.endsWith('.sql'))
            .sort();

        if (migrationFiles.length === 0) {
            console.log('No migration files detected, nothing to run.');
            return;
        }

        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            multipleStatements: true,
        });

        console.log(`Connected to database ${process.env.DB_NAME}`);
        console.log(`Running ${migrationFiles.length} better-auth migration(s)...`);

        for (const file of migrationFiles) {
            const migrationPath = path.join(migrationsDir, file);
            const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

            if (!migrationSQL.trim()) {
                console.log(`- Skipping empty migration ${file}`);
                continue;
            }

            console.log(`→ Executing ${file}`);
            await connection.query(migrationSQL);
            console.log(`✓ Completed ${file}`);
        }

        await connection.end();
        console.log('All better-auth migrations executed successfully.');
    } catch (error) {
        console.error('Better-auth migrations failed:', error);
        process.exit(1);
    }
}

runMigrations();