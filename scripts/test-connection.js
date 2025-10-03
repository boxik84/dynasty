import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: resolve(__dirname, '../.env.local') });

async function testConnection() {
  const dbUrl = process.env.DATABASE_URL;
  
  if (!dbUrl) {
    console.error('❌ DATABASE_URL není nastavena');
    process.exit(1);
  }

  console.log('🔌 Testování připojení k databázi...\n');
  
  let connection;
  try {
    connection = await mysql.createConnection({ uri: dbUrl });
    console.log('✅ Připojení k databázi úspěšné!\n');
    
    // Test tables
    console.log('📊 Kontrola tabulek:\n');
    
    const tables = ['user', 'session', 'account', 'verification', 'password'];
    
    for (const table of tables) {
      const [rows] = await connection.query(`SHOW TABLES LIKE '${table}'`);
      if (rows.length > 0) {
        const [count] = await connection.query(`SELECT COUNT(*) as count FROM \`${table}\``);
        console.log(`   ✅ ${table.padEnd(15)} - Záznamů: ${count[0].count}`);
      } else {
        console.log(`   ❌ ${table.padEnd(15)} - NEEXISTUJE`);
      }
    }
    
    console.log('\n🎉 Better Auth je správně nakonfigurován a připraven!');
    console.log('\n📝 Další kroky:');
    console.log('   1. Spusť dev server: pnpm dev');
    console.log('   2. Better Auth API je dostupné na: http://localhost:3000/api/auth');
    console.log('   3. Můžeš začít používat signUp, signIn, signOut funkce');
    
  } catch (error) {
    console.error('❌ Chyba:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Odpojeno od databáze');
    }
  }
}

testConnection();
