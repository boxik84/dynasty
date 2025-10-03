import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrations() {
  const dbUrl = process.env.DATABASE_URL;
  
  if (!dbUrl) {
    console.error('❌ DATABASE_URL není nastavena v .env.local');
    process.exit(1);
  }

  console.log('🔌 Připojuji se k databázi...');
  
  let connection;
  try {
    // Create connection
    connection = await mysql.createConnection({
      uri: dbUrl,
      multipleStatements: true
    });

    console.log('✅ Připojení k databázi úspěšné!');
    
    // Read migration file
    const migrationPath = path.join(__dirname, '../migrations/001_better_auth_tables.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📝 Spouštím migrace...');
    
    // Execute migration
    await connection.query(migrationSQL);
    
    console.log('✅ Migrace byly úspěšně aplikovány!');
    console.log('');
    console.log('📊 Vytvořené tabulky:');
    console.log('   - user (uživatelé)');
    console.log('   - session (session)');
    console.log('   - account (OAuth účty)');
    console.log('   - verification (verifikační tokeny)');
    console.log('   - password (hesla)');
    console.log('');
    console.log('🎉 Better Auth je připraven k použití!');
    
  } catch (error) {
    console.error('❌ Chyba při spouštění migrací:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Odpojeno od databáze');
    }
  }
}

// Load environment variables
import dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../.env.local') });

runMigrations();