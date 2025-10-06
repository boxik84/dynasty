# 🔄 Migrace na Prisma - Dynasty FiveM Web

## ✅ CO JE HOTOVÉ

### 1. **Prisma Schema** ✓
- ✅ Kompletní schema v `prisma/schema.prisma`
- ✅ Better Auth modely (User, Session, Account, Verification)
- ✅ Custom modely (WhitelistRequest, Activity, Rule, RuleSection, RuleSubcategory, WhitelistQuestion, BackupLog, PhotoContestEntry, PhotoContestVote)
- ✅ Správné vztahy a indexy

### 2. **Konfigurace** ✓
- ✅ `package.json` - Prisma skripty přidány
- ✅ `.env.local` - DATABASE_URL nakonfigurováno
- ✅ `lib/prisma.ts` - Prisma Client singleton
- ✅ `lib/auth.ts` - Better Auth s Prisma adapterem
- ✅ `lib/db.ts` - ODSTRANĚNO (není potřeba)
- ✅ `lib/db-fivem.ts` - ZACHOVÁNO (pro FiveM databázi)

### 3. **Instalace** ✓
- ✅ Závislosti nainstalovány (`pnpm install`)
- ✅ Prisma Client vygenerován

### 4. **API Endpointy - ČÁSTEČNĚ HOTOVÉ**

#### Přepsané na Prisma:
- ✅ `/api/whitelist/route.ts` - GET/POST
- ✅ `/api/whitelist/status/route.ts` - GET
- ✅ `/api/whitelist-questions/route.ts` - GET

---

## ⚠️ CO JEŠTĚ ZBÝVÁ UDĚLAT

### **API Endpointy k přepsání (25 souborů):**

#### Admin Endpointy:
1. `/app/api/admin/activities/route.ts` - GET/POST
2. `/app/api/admin/activities/[id]/route.ts` - PATCH/DELETE
3. `/app/api/admin/rules/route.ts` - GET/POST/PATCH/DELETE
4. `/app/api/admin/users/route.ts`
5. `/app/api/admin/whitelist-questions/route.ts` - GET/POST
6. `/app/api/admin/whitelist-questions/[id]/route.ts` - PATCH/DELETE
7. `/app/api/admin/backup/route.ts`
8. `/app/api/admin/migrate-whitelist/route.ts`
9. `/app/api/admin/fotosoutez/contests/route.ts`
10. `/app/api/admin/fotosoutez/submissions/route.ts`
11. `/app/api/admin/fotosoutez/submissions/[id]/route.ts`

#### User Endpointy:
12. `/app/api/user/me/route.ts`
13. `/app/api/user/whitelist-requests/route.ts`
14. `/app/api/account-id/route.ts`

#### Whitelist Endpointy:
15. `/app/api/whitelist/[id]/route.ts` - PATCH/DELETE
16. `/app/api/whitelist-detail/[id]/route.ts`
17. `/app/api/whitelist-detail/[id]/notes/route.ts`

#### Ostatní:
18. `/app/api/dashboard-stats/route.ts`
19. `/app/api/debug-discord-roles/route.ts`
20. `/app/api/database-characters/[id]/route.ts`
21. `/app/api/statistics/route.ts`
22. `/app/api/rules/route.ts`
23. `/app/api/fotosoutez/route.ts`
24. `/app/api/fotosoutez/submissions/route.ts`
25. `/app/api/fotosoutez/likes/route.ts`

---

## 🔧 JAK PŘEPSAT ENDPOINT NA PRISMA

### **Před (MySQL2):**
\`\`\`typescript
import database from '@/lib/db'

// Dotaz
const [rows] = await database.execute(
    'SELECT * FROM whitelist_requests WHERE user_id = ?',
    [userId]
)
const requests = rows as any[]
\`\`\`

### **Po (Prisma):**
\`\`\`typescript
import prisma from '@/lib/prisma'

// Dotaz
const requests = await prisma.whitelistRequest.findMany({
    where: {
        userId: userId
    }
})
\`\`\`

### **Vzory pro Prisma operace:**

#### SELECT (findMany):
\`\`\`typescript
const users = await prisma.user.findMany({
    where: { emailVerified: true },
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, email: true }
})
\`\`\`

#### SELECT ONE (findFirst nebo findUnique):
\`\`\`typescript
const user = await prisma.user.findUnique({
    where: { id: userId }
})
\`\`\`

#### INSERT (create):
\`\`\`typescript
const newRequest = await prisma.whitelistRequest.create({
    data: {
        userId: session.user.id,
        formData: formData,
        status: 'pending'
    }
})
\`\`\`

#### UPDATE (update nebo updateMany):
\`\`\`typescript
await prisma.whitelistRequest.update({
    where: { id: requestId },
    data: { status: 'approved' }
})
\`\`\`

#### DELETE (delete nebo deleteMany):
\`\`\`typescript
await prisma.whitelistRequest.delete({
    where: { id: requestId }
})
\`\`\`

#### COUNT:
\`\`\`typescript
const count = await prisma.whitelistRequest.count({
    where: { status: 'pending' }
})
\`\`\`

---

## 🚀 DEPLOYMENT KROKY

### 1. **Před prvním spuštěním:**
\`\`\`bash
# Ujisti se, že databázový server běží a je dostupný
pnpm prisma:push  # Synchronizuje schema s databází
pnpm prisma:generate  # Vygeneruje Prisma Client
\`\`\`

### 2. **Development:**
\`\`\`bash
pnpm dev
\`\`\`

### 3. **Production Build:**
\`\`\`bash
pnpm build  # Automaticky zavolá prisma generate
pnpm start
\`\`\`

---

## 📊 MAPOVÁNÍ TABULEK NA PRISMA MODELY

| SQL Tabulka | Prisma Model | Poznámka |
|-------------|--------------|----------|
| \`user\` | \`User\` | Better Auth |
| \`session\` | \`Session\` | Better Auth |
| \`account\` | \`Account\` | Better Auth |
| \`verification\` | \`Verification\` | Better Auth |
| \`whitelist_requests\` | \`WhitelistRequest\` | snake_case → camelCase |
| \`activities\` | \`Activity\` | - |
| \`rule_sections\` | \`RuleSection\` | - |
| \`rule_subcategories\` | \`RuleSubcategory\` | Composite primary key |
| \`rules\` | \`Rule\` | - |
| \`whitelist_questions\` | \`WhitelistQuestion\` | - |
| \`backup_logs\` | \`BackupLog\` | - |
| \`photo_contest_entries\` | \`PhotoContestEntry\` | - |
| \`photo_contest_votes\` | \`PhotoContestVote\` | - |

---

## ⚡ UŽITEČNÉ PRISMA PŘÍKAZY

\`\`\`bash
# Vygenerovat Prisma Client
pnpm prisma:generate

# Pushnout schema do databáze (bez migracích souborů)
pnpm prisma:push

# Vytvořit migraci
pnpm prisma:migrate

# Otevřít Prisma Studio (GUI pro databázi)
pnpm prisma:studio

# Validovat schema
pnpm prisma validate

# Formátovat schema
pnpm prisma format
\`\`\`

---

## 🐛 ŘEŠENÍ PROBLÉMŮ

### Problem: "Cannot find module '@prisma/client'"
**Řešení:**
\`\`\`bash
pnpm prisma:generate
\`\`\`

### Problem: "Can't reach database server"
**Řešení:**
1. Zkontroluj, že DB server běží
2. Zkontroluj DATABASE_URL v .env.local
3. Zkontroluj firewall pravidla

### Problem: "Table doesn't exist"
**Řešení:**
\`\`\`bash
pnpm prisma:push
\`\`\`

### Problem: TypeScript chyby po generování
**Řešení:**
1. Restartuj TypeScript server v VS Code
2. Zavři a znovu otevři projekt

---

## 📝 POZNÁMKY

### **JSON Fields:**
- Prisma automaticky serializuje/deserializuje JSON
- Není potřeba \`JSON.stringify()\` nebo \`JSON.parse()\`
- Příklad:
  \`\`\`typescript
  // Uložení
  await prisma.whitelistRequest.create({
      data: {
          formData: { name: "John", age: 25 } // Automaticky se uloží jako JSON
      }
  })
  
  // Načtení
  const request = await prisma.whitelistRequest.findFirst()
  console.log(request.formData) // { name: "John", age: 25 }
  \`\`\`

### **Enums:**
- Definovány v schema jako \`enum WhitelistStatus\`
- TypeScript automaticky ví o možných hodnotách
- Příklad: \`status: 'pending'\` ✓ vs \`status: 'invalid'\` ✗

### **Relace:**
- Prisma automaticky načítá vztahy pomocí \`include\`
- Příklad:
  \`\`\`typescript
  const request = await prisma.whitelistRequest.findFirst({
      include: {
          user: true  // Automaticky načte souvisejícího uživatele
      }
  })
  \`\`\`

---

## 🎯 DOPORUČENÉ KROKY PRO DOKONČENÍ

1. ✅ **Zkontroluj Prisma schema** - Hotové
2. ✅ **Nakonfiguruj prostředí** - Hotové
3. ⚠️ **Přepiš zbývající API endpointy** - Zbývá 25 souborů
4. ⚠️ **Otestuj všechny endpointy**
5. ⚠️ **Spusť \`prisma:push\` na produkčním serveru**
6. ⚠️ **Ověř funkčnost aplikace**

---

## 📞 DALŠÍ POMOC

Pokud potřebuješ pomoct s přepsáním konkrétního endpointu:
1. Podívej se na hotové příklady výše
2. Použij Prisma dokumentaci: https://www.prisma.io/docs
3. Využij příklady vzorů v tomto dokumentu

**Autor:** GitHub Copilot  
**Datum:** 4. října 2025  
**Verze:** 1.0
