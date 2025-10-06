# ✅ Prisma Migration Checklist

## Postup pro dokončení migrace:

### 1. První spuštění ✓
- [x] Zkontrolovat DATABASE_URL v `.env.local`
- [ ] Spustit `pnpm prisma:push` (když je DB dostupná)
- [x] Spustit `pnpm prisma:generate`
- [ ] Testovat `pnpm dev`

### 2. API Endpointy k přepsání (25 souborů)

#### Admin Endpointy (11 souborů)
- [ ] `/app/api/admin/activities/route.ts`
- [ ] `/app/api/admin/activities/[id]/route.ts`
- [ ] `/app/api/admin/rules/route.ts`
- [ ] `/app/api/admin/users/route.ts`
- [ ] `/app/api/admin/whitelist-questions/route.ts`
- [ ] `/app/api/admin/whitelist-questions/[id]/route.ts`
- [ ] `/app/api/admin/backup/route.ts`
- [ ] `/app/api/admin/migrate-whitelist/route.ts`
- [ ] `/app/api/admin/fotosoutez/contests/route.ts`
- [ ] `/app/api/admin/fotosoutez/submissions/route.ts`
- [ ] `/app/api/admin/fotosoutez/submissions/[id]/route.ts`

#### User Endpointy (3 soubory)
- [ ] `/app/api/user/me/route.ts`
- [ ] `/app/api/user/whitelist-requests/route.ts`
- [ ] `/app/api/account-id/route.ts`

#### Whitelist Endpointy (3 soubory)
- [x] `/app/api/whitelist/route.ts` ✅
- [x] `/app/api/whitelist/status/route.ts` ✅
- [ ] `/app/api/whitelist/[id]/route.ts`
- [ ] `/app/api/whitelist-detail/[id]/route.ts`
- [ ] `/app/api/whitelist-detail/[id]/notes/route.ts`

#### Ostatní (8 souborů)
- [ ] `/app/api/dashboard-stats/route.ts`
- [ ] `/app/api/debug-discord-roles/route.ts`
- [ ] `/app/api/database-characters/[id]/route.ts`
- [ ] `/app/api/statistics/route.ts`
- [ ] `/app/api/rules/route.ts`
- [ ] `/app/api/fotosoutez/route.ts`
- [ ] `/app/api/fotosoutez/submissions/route.ts`
- [ ] `/app/api/fotosoutez/likes/route.ts`
- [x] `/app/api/whitelist-questions/route.ts` ✅

### 3. Testování
- [ ] Test whitelist formulář (vytvoření žádosti)
- [ ] Test whitelist status (zobrazení statusu)
- [ ] Test admin panel - aktivity (CRUD)
- [ ] Test admin panel - pravidla (CRUD)
- [ ] Test admin panel - whitelist správa
- [ ] Test admin panel - whitelist otázky
- [ ] Test fotosoutěž (pokud je aktivní)
- [ ] Test dashboard statistiky
- [ ] Test user profile

### 4. Optimalizace a cleanup
- [ ] Odstranit všechny `import database from '@/lib/db'`
- [ ] Zkontrolovat, že všude je `import prisma from '@/lib/prisma'`
- [ ] Smazat nepoužívané SQL migration soubory (volitelné)
- [ ] Přidat indexy do Prisma schema (pokud potřeba)

### 5. Production deployment
- [ ] Commitnout změny do gitu
- [ ] Spustit `pnpm build` (test build)
- [ ] Na serveru spustit `pnpm prisma:push`
- [ ] Na serveru spustit `pnpm build`
- [ ] Restartovat aplikaci
- [ ] Otestovat produkční verzi

---

## 🎯 Priorita úkolů:

### VYSOKÁ PRIORITA (kritické pro funkčnost):
1. `/app/api/user/me/route.ts` - uživatelská autentizace
2. `/app/api/admin/rules/route.ts` - správa pravidel
3. `/app/api/admin/activities/route.ts` - správa aktivit
4. `/app/api/whitelist/[id]/route.ts` - whitelist approval/reject
5. `/app/api/dashboard-stats/route.ts` - statistiky

### STŘEDNÍ PRIORITA:
6. `/app/api/admin/whitelist-questions/route.ts`
7. `/app/api/rules/route.ts` - public pravidla
8. `/app/api/statistics/route.ts`
9. `/app/api/admin/users/route.ts`

### NÍZKÁ PRIORITA (pokud se používá):
10. Fotosoutěž endpointy
11. Debug endpointy
12. Backup logs

---

## 📝 Poznámky k migraci:

### Časté změny:

1. **Import:**
   \`\`\`typescript
   // Před
   import database from '@/lib/db'
   
   // Po
   import prisma from '@/lib/prisma'
   \`\`\`

2. **SELECT:**
   \`\`\`typescript
   // Před
   const [rows] = await database.execute('SELECT * FROM users')
   
   // Po
   const rows = await prisma.user.findMany()
   \`\`\`

3. **INSERT:**
   \`\`\`typescript
   // Před
   await database.execute(
       'INSERT INTO users (name, email) VALUES (?, ?)',
       [name, email]
   )
   
   // Po
   await prisma.user.create({
       data: { name, email }
   })
   \`\`\`

4. **UPDATE:**
   \`\`\`typescript
   // Před
   await database.execute(
       'UPDATE users SET name = ? WHERE id = ?',
       [name, id]
   )
   
   // Po
   await prisma.user.update({
       where: { id },
       data: { name }
   })
   \`\`\`

5. **DELETE:**
   \`\`\`typescript
   // Před
   await database.execute('DELETE FROM users WHERE id = ?', [id])
   
   // Po
   await prisma.user.delete({
       where: { id }
   })
   \`\`\`

6. **JSON data:**
   \`\`\`typescript
   // Před
   formData: JSON.stringify(data)
   const parsed = JSON.parse(row.formData)
   
   // Po
   formData: data  // Prisma automaticky serializes/deserializes
   const parsed = row.formData  // Already an object
   \`\`\`

---

## 🚀 Užitečné příkazy:

\`\`\`bash
# Vygenerovat Prisma Client
pnpm prisma:generate

# Pushnout schema do DB
pnpm prisma:push

# Otevřít Prisma Studio
pnpm prisma:studio

# Spustit dev server
pnpm dev

# Build pro produkci
pnpm build
\`\`\`

---

*Poslední aktualizace: 4. října 2025*
