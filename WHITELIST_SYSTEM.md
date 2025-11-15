# Whitelist System Documentation

## Přehled systému

Whitelist systém umožňuje uživatelům podávat žádosti o přístup na server a administrátorům je spravovat. Systém je integrován s Discord API pro automatické přidělování rolí.

## Databázová struktura

### Tabulka `whitelist_requests`

```sql
CREATE TABLE whitelist_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    serial_number VARCHAR(20) UNIQUE NULL,  -- Formát: WL-YYYY-NNNN
    user_id VARCHAR(255) NOT NULL,          -- ID uživatele z auth systému
    form_data JSON NOT NULL,                -- Data z formuláře
    status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    notes TEXT NULL,                        -- Poznámky administrátora
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexy pro lepší výkon
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_serial_number (serial_number),
    INDEX idx_created_at (created_at),
    INDEX idx_updated_at (updated_at),
    INDEX idx_notes (notes(255))
);
```

### Tabulka `whitelist_questions`

```sql
CREATE TABLE whitelist_questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question TEXT NOT NULL,
    field_name VARCHAR(100) NOT NULL UNIQUE,
    field_type ENUM('text', 'textarea', 'number', 'checkbox', 'url', 'select') NOT NULL DEFAULT 'text',
    placeholder VARCHAR(255),
    required BOOLEAN DEFAULT TRUE,
    category VARCHAR(50) DEFAULT 'general',
    options JSON,                           -- Pro select pole
    min_value INT,
    max_value INT,
    min_length INT,
    max_length INT,
    order_index INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_category (category),
    INDEX idx_order (order_index),
    INDEX idx_active (is_active)
);
```

## API Endpointy

### 1. Vytvoření whitelist žádosti
```
POST /api/whitelist
```

**Request Body:**
```json
{
  "formData": {
    "discordName": "jakuubboss",
    "age": "25",
    "steamProfile": "https://steamcommunity.com/id/...",
    "fivemHours": "500 hodin",
    "whyJoinServer": "Chci hrát roleplay...",
    // ... další pole podle whitelist_questions
  }
}
```

**Response:**
```json
{
  "message": "Whitelist žádost byla úspěšně odeslána",
  "totalAttempts": 1,
  "remainingAttempts": 2,
  "maxAttempts": 3
}
```

### 2. Získání všech whitelist žádostí (admin)
```
GET /api/whitelist
```

**Response:**
```json
{
  "requests": [
    {
      "id": 1,
      "user_id": "user_123",
      "form_data": "{\"discordName\": \"jakuubboss\", ...}",
      "status": "pending",
      "serial_number": "WL-2025-0001",
      "created_at": "2025-01-15T14:30:00.000Z",
      "updated_at": "2025-01-15T14:30:00.000Z"
    }
  ]
}
```

### 3. Schválení/odmítnutí žádosti (admin)
```
PATCH /api/whitelist/{id}
```

**Request Body:**
```json
{
  "status": "approved" // nebo "rejected"
}
```

**Response:**
```json
{
  "message": "Whitelist žádost byla schválena",
  "discordNotified": true,
  "roleUpdated": true,
  "discordError": null,
  "discordId": "123456789"
}
```

### 4. Získání whitelist otázek
```
GET /api/whitelist-questions
```

**Response:**
```json
{
  "questions": [
    {
      "id": 1,
      "question": "Discord jméno (např. jakuubboss)",
      "field_name": "discordName",
      "field_type": "text",
      "placeholder": "jakuubboss",
      "required": true,
      "category": "basic",
      "order_index": 1
    }
  ],
  "categories": {
    "basic": [...],
    "motivation": [...],
    "roleplay": [...]
  }
}
```

### 5. Získání uživatelských žádostí
```
GET /api/user/whitelist-requests
```

**Response:**
```json
{
  "requests": [...],
  "totalAttempts": 1,
  "remainingAttempts": 2,
  "maxAttempts": 3,
  "activeRequest": null,
  "canSubmitNew": true,
  "hasWhitelist": false
}
```

## Migrace

### Pořadí migrací:
1. `2025-01-15T14-00-00.000Z_create_whitelist_requests.sql` - Základní tabulka
2. `2025-01-15T14-30-00.000Z_add_serial_number_to_whitelist.sql` - Přidání seriových čísel
3. `2025-01-15T15-00-00.000Z_add_notes_to_whitelist.sql` - Přidání poznámek
4. `2025-01-16T14-00-00.000Z_create_whitelist_questions.sql` - Konfigurace otázek

## Discord integrace

Systém automaticky:
- Odešle notifikaci na Discord při schválení/odmítnutí
- Přidá/odebere whitelist roli podle statusu
- Odebere waiting roli při zamítnutí

## Omezení

- Maximálně 3 pokusy na uživatele
- Pouze jedna aktivní žádost najednou
- Automatické generování seriových čísel (WL-YYYY-NNNN)

## Frontend komponenty

- `/whitelist` - Formulář pro podání žádosti
- `/dashboard/whitelist` - Admin panel pro správu žádostí
- `/dashboard/my-whitelist` - Uživatelský přehled žádostí
- `/dashboard/whitelist-detail/[id]` - Detail konkrétní žádosti

## Bezpečnost

- Kontrola Discord rolí pro admin přístup
- Validace formulářových dat
- Rate limiting na API endpointy
- Sanitizace vstupních dat 