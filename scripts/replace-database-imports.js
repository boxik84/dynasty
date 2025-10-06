#!/usr/bin/env node

/**
 * Skript pro hromadné nahrazení importů z '@/lib/db' na '@/lib/prisma'
 * v API endpointech
 * 
 * Použití: node scripts/replace-database-imports.js
 */

const fs = require('fs');
const path = require('path');

// Cesty k API adresářům
const apiDir = path.join(__dirname, '..', 'app', 'api');

// Rekurzivní funkce pro procházení adresářů
function walkDir(dir, callback) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      walkDir(filePath, callback);
    } else if (stat.isFile() && (file.endsWith('.ts') || file.endsWith('.tsx'))) {
      callback(filePath);
    }
  });
}

// Funkce pro náhradu importů
function replaceImports(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Náhrada importu database na prisma
  if (content.includes("from '@/lib/db'") || content.includes('from "@/lib/db"')) {
    content = content.replace(/import\s+database\s+from\s+['"]@\/lib\/db['"]/g, "import prisma from '@/lib/prisma'");
    content = content.replace(/database\./g, 'prisma.');
    content = content.replace(/database,/g, 'prisma,');
    modified = true;
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Upraveno: ${filePath.replace(process.cwd(), '')}`);
    return true;
  }
  
  return false;
}

// Hlavní funkce
function main() {
  console.log('🔄 Začínám nahrazovat importy database za prisma...\n');
  
  let count = 0;
  walkDir(apiDir, (filePath) => {
    if (replaceImports(filePath)) {
      count++;
    }
  });
  
  console.log(`\n✅ Hotovo! Upraveno ${count} souborů.`);
  console.log('\n⚠️  UPOZORNĚNÍ: Toto je pouze první krok!');
  console.log('📝 Stále musíš přepsat SQL dotazy na Prisma queries.');
  console.log('📖 Viz PRISMA_MIGRATION.md pro návod.\n');
}

main();
