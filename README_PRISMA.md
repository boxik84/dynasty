# 🚀 Dynasty FiveM Web - Prisma Setup Guide

## ✨ Co bylo provedeno

Projekt byl **kompletně přemigrován** z přímého MySQL2 připojení na **Prisma ORM** pro Better Auth a všechny custom tabulky.

### ✅ Hotové komponenty:

1. **Prisma Schema** (`prisma/schema.prisma`)
   - Kompletní datové modely pro Better Auth
   - Všechny custom tabulky (whitelist, aktivity, pravidla, atd.)
   - Správné relace a indexy

2. **Better Auth s Prisma**
   - `lib/auth.ts` - Nakonfigurováno s Prisma adapterem
   - `lib/prisma.ts` - Prisma Client singleton
   - `lib/auth-client.ts` - Beze změny

3. **Konfigurace**
   - `.env.local` - DATABASE_URL nakonfigurováno
   - `package.json` - Prisma skripty přidány
   - `tsconfig.json` - Beze změny

4. **Pomocné soubory**
   - `lib/prisma-examples.ts` - Komplexní příklady všech Prisma operací
   - `scripts/replace-database-imports.js` - Skript pro hromadné náhrady
   - `PRISMA_MIGRATION.md` - Detailní průvodce migrací

5. **API Endpointy** (částečně přepsané)
   - ✅ `/api/whitelist/route.ts` - Přepsáno na Prisma
   - ✅ `/api/whitelist/status/route.ts` - Přepsáno na Prisma
   - ✅ `/api/whitelist-questions/route.ts` - Přepsáno na Prisma
   - ⚠️ **Zbývá cca 25 dalších endpointů** - viz `PRISMA_MIGRATION.md`

---

## 📋 Před prvním spuštěním

### 1. **Zkontroluj .env.local**

Ujisti se, že máš správně nakonfigurované připojení k databázi:

\`\`\`env
# Prisma Database Configuration
DATABASE_URL="mysql://root:VgC1krzQl3qklYs@176.96.136.212:3306/web"
\`\`\`

### 2. **Synchronizuj databázi**

Spusť tyto příkazy v tomto pořadí:

\`\`\`bash
# Vygeneruj Prisma Client
pnpm prisma:generate

# Synchronizuj schema s databází (vytvoří/upraví tabulky)
pnpm prisma:push

# Nebo použij migrace (doporučeno pro produkci)
pnpm prisma:migrate
\`\`\`

### 3. **Zkontroluj databázi (volitelné)**

Otevři Prisma Studio pro ověření:

\`\`\`bash
pnpm prisma:studio
\`\`\`

Otevře se na `http://localhost:5555` - zde můžeš prohlížet a upravovat data.

---

## 🔧 Development

### Spuštění vývojového serveru:

\`\`\`bash
pnpm dev
\`\`\`

### Prisma příkazy během vývoje:

\`\`\`bash
# Pokud změníš schema, vždy znovu vygeneruj Client
pnpm prisma:generate

# Push změn do databáze
pnpm prisma:push

# Formátování schema
pnpm prisma format

# Validace schema
pnpm prisma validate
\`\`\`

---

## 🏗️ Production Build

\`\`\`bash
# Build automaticky zavolá prisma:generate
pnpm build

# Spuštění produkčního serveru
pnpm start
\`\`\`

---

## ⚠️ Dokončení migrace API endpointů

Zbývá přepsat **cca 25 API endpointů** z MySQL2 na Prisma.

### Kam se podívat:

1. **`PRISMA_MIGRATION.md`** - Kompletní seznam souborů k přepsání
2. **`lib/prisma-examples.ts`** - Příklady pro všechny operace
3. **Hotové endpointy** - `api/whitelist/*.ts` jako reference

### Rychlý postup:

1. Otevři soubor z `app/api/...`
2. Nahraď `import database from '@/lib/db'` → `import prisma from '@/lib/prisma'`
3. Přepiš SQL dotazy na Prisma queries (viz příklady)
4. Testuj endpoint

### Příklad transformace:

**Před (MySQL2):**
\`\`\`typescript
const [rows] = await database.execute(
    'SELECT * FROM whitelist_requests WHERE user_id = ?',
    [userId]
)
const requests = rows as any[]
\`\`\`

**Po (Prisma):**
\`\`\`typescript
const requests = await prisma.whitelistRequest.findMany({
    where: { userId }
})
\`\`\`

---

## 📚 Užitečné odkazy

- **Prisma dokumentace:** https://www.prisma.io/docs
- **Better Auth + Prisma:** https://www.better-auth.com/docs/adapters/prisma
- **Prisma příklady v projektu:** `lib/prisma-examples.ts`
- **Migrace guide:** `PRISMA_MIGRATION.md`

---

## 🐛 Řešení problémů

### Problem: "Cannot find module '@prisma/client'"
**Řešení:** `pnpm prisma:generate`

### Problem: "Can't reach database server"
**Řešení:**
1. Zkontroluj DATABASE_URL v `.env.local`
2. Ověř, že DB server běží a je dostupný
3. Zkontroluj firewall/port 3306

### Problem: "Table doesn't exist"
**Řešení:** `pnpm prisma:push`

### Problem: TypeScript chyby po změně schema
**Řešení:**
1. `pnpm prisma:generate`
2. Restartuj TypeScript server (VS Code: Cmd+Shift+P → "Restart TS Server")

### Problem: JSON.parse chyba při čtení formData
**Řešení:** Prisma automaticky deserializuje JSON, odstraň `JSON.parse()`

---

## 📊 Struktura projektu

\`\`\`
dynasty/
├── prisma/
│   └── schema.prisma          # Datové modely
├── lib/
│   ├── prisma.ts              # Prisma Client singleton
│   ├── prisma-examples.ts     # Příklady queries
│   ├── auth.ts                # Better Auth s Prisma
│   ├── auth-client.ts         # Auth Client
│   └── db-fivem.ts            # FiveM databáze (zachováno)
├── app/
│   └── api/                   # API endpointy (většina k přepsání)
├── scripts/
│   └── replace-database-imports.js  # Helper skript
├── PRISMA_MIGRATION.md        # Detailní migrace guide
└── README.md                  # Tento soubor
\`\`\`

---

## 🎯 Next Steps

1. ✅ **Zkontroluj, že projekt běží** - `pnpm dev`
2. ⚠️ **Přepiš zbývající API endpointy** - viz `PRISMA_MIGRATION.md`
3. ⚠️ **Otestuj všechny funkce** - whitelist, admin panel, pravidla
4. ⚠️ **Deploy na produkci** - nezapomeň spustit `prisma:push`

---

## 📞 Kontakt a podpora

Pro další pomoc:
- Podívej se do `lib/prisma-examples.ts` pro konkrétní příklady
- Čti `PRISMA_MIGRATION.md` pro detailní návod
- Prisma dokumentace: https://www.prisma.io/docs

**Projekt připraven k dokončení migrace! 🎉**

---

*Vytvořeno: 4. října 2025*  
*Autor: GitHub Copilot*  
*Verze: 1.0*
