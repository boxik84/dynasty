const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function runMigration() {
    try {
        // Load environment variables
        require('dotenv').config();

        // Create database connection
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });

        console.log('Connected to database');

        // Read the migration file
        const migrationPath = path.join(__dirname, '..', 'better-auth_migrations', '2025-01-16T14-00-00.000Z_create_whitelist_questions.sql');
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

        // Split by semicolon and filter out empty statements
        const statements = migrationSQL
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

        console.log(`Running ${statements.length} SQL statements...`);

        // Execute each statement
        for (const statement of statements) {
            if (statement.trim()) {
                await connection.execute(statement);
                console.log('✓ Executed statement');
            }
        }

        console.log('Migration completed successfully!');
        await connection.end();
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

runMigration(); 