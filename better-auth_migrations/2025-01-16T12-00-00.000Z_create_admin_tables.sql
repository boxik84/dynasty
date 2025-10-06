-- Migration: Create admin functionality tables
-- Date: 2025-01-16 12:00:00

-- Create activities table
CREATE TABLE IF NOT EXISTS activities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nazev VARCHAR(255) NOT NULL,
    popis TEXT NOT NULL,
    obrazek VARCHAR(500),
    icon VARCHAR(255),
    odmena VARCHAR(255),
    vzdalenost VARCHAR(255),
    cas VARCHAR(255),
    riziko VARCHAR(255) NOT NULL,
    riziko_level ENUM('low', 'medium', 'high', 'extreme') NOT NULL DEFAULT 'low',
    category ENUM('legal', 'illegal', 'heist') NOT NULL DEFAULT 'legal',
    span INT DEFAULT 1,
    gradient VARCHAR(255),
    border_color VARCHAR(255),
    glow_color VARCHAR(255),
    order_index INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_riziko_level (riziko_level),
    INDEX idx_order (order_index)
);

-- Create rule_sections table
CREATE TABLE IF NOT EXISTS rule_sections (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    icon VARCHAR(255),
    order_index INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_order (order_index)
);

-- Create rule_subcategories table
CREATE TABLE IF NOT EXISTS rule_subcategories (
    id VARCHAR(50) NOT NULL,
    section_id VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    icon VARCHAR(255),
    order_index INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (section_id, id),
    FOREIGN KEY (section_id) REFERENCES rule_sections(id) ON DELETE CASCADE,
    INDEX idx_order (section_id, order_index)
);

-- Create rules table
CREATE TABLE IF NOT EXISTS rules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    section_id VARCHAR(50),
    subcategory_id VARCHAR(50),
    content TEXT NOT NULL,
    order_index INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (section_id) REFERENCES rule_sections(id) ON DELETE CASCADE,
    INDEX idx_section (section_id),
    INDEX idx_subcategory (section_id, subcategory_id),
    INDEX idx_order (section_id, subcategory_id, order_index)
);

-- Insert default rule sections
INSERT INTO rule_sections (id, title, icon, order_index) VALUES
('obecna', 'Obecná pravidla', 'FileText', 0),
('zakladni', 'Základní pojmy', 'Gamepad2', 1),
('discord', 'Discord pravidla', 'MessageCircle', 2),
('roleplay', 'Roleplay pravidla', 'Users', 3),
('vozidla', 'Vozidla', 'Car', 4),
('zlocin', 'Zločin', 'Shield', 5)
ON DUPLICATE KEY UPDATE 
title = VALUES(title), 
icon = VALUES(icon), 
order_index = VALUES(order_index);

-- Insert default rule subcategories
INSERT INTO rule_subcategories (section_id, id, title, icon, order_index) VALUES
('zakladni', 'gang', 'Gang pravidla', 'Zap', 0),
('zakladni', 'nelegalni', 'Nelegální Pravidla', 'Users', 1),
('roleplay', 'charakter', 'Charakter', 'User', 0),
('roleplay', 'interakce', 'Interakce', 'MessageSquare', 1),
('vozidla', 'provoz', 'Silniční provoz', 'Navigation', 0),
('vozidla', 'kradenice', 'Kradené vozidla', 'AlertTriangle', 1),
('zlocin', 'loupezy', 'Loupeže', 'DollarSign', 0),
('zlocin', 'strelba', 'Střelba', 'Target', 1)
ON DUPLICATE KEY UPDATE 
title = VALUES(title), 
icon = VALUES(icon), 
order_index = VALUES(order_index);

-- Insert default rules
INSERT INTO rules (section_id, subcategory_id, content, order_index) VALUES
-- Obecná pravidla
('obecna', NULL, 'Všechny pravidla jsou platné napříč celým serverem a každý hráč je povinen se jimi řídit.', 0),
('obecna', NULL, 'Neznalosť pravidel neomluví porušení pravidel.', 1),
('obecna', NULL, 'Admini mají právo udělit trest podle vlastního uvážení, pokud situace není přesně pokryta pravidly.', 2),
('obecna', NULL, 'Je zakázáno exploitovat jakékoli bugy nebo glitche. Pokud nějaký najdete, nahlaste ho na Discord.', 3),
('obecna', NULL, 'Jakékoli chování, které narušuje zážitek ostatních hráčů, může být potrestáno.', 4),
('obecna', NULL, 'Server je určen pro hráče 18+. Mladší hráči budou odebráni z whitelistu.', 5),

-- Základní pojmy - Gang pravidla
('zakladni', 'gang', 'Gang může mít maximálně 8 aktivních členů současně na serveru.', 0),
('zakladni', 'gang', 'Mezi gangy musí být minimálně 30 minut pauzy mezi konflikty.', 1),
('zakladni', 'gang', 'Gang wars musí být ohlášeny adminům předem a musí mít roleplay důvod.', 2),
('zakladni', 'gang', 'Neutralita musí být respektována - neutral osoby nesmí být vtaženy do konfliktů.', 3),

-- Základní pojmy - Nelegální pravidla
('zakladni', 'nelegalni', 'Pokud jste zadrženi policií, musíte se podrobit roleplay.', 0),
('zakladni', 'nelegalni', 'Nelegalní aktivity musí mít roleplay pozadí, není to jen o penězích.', 1),
('zakladni', 'nelegalni', 'Spolupráce s PD je povolena, ale musí být odůvodněna roleplay způsobem.', 2),

-- Discord pravidla
('discord', NULL, 'Buďte slušní a respektující k ostatním členům.', 0),
('discord', NULL, 'Žádný spam, toxicita nebo nevhodný obsah.', 1),
('discord', NULL, 'Používejte správné kanály pro odpovídající obsah.', 2),
('discord', NULL, 'Respektujte rozhodnutí adminů a moderátorů.', 3),
('discord', NULL, 'Žádné politické nebo náboženské diskuze.', 4),

-- Roleplay pravidla - Charakter
('roleplay', 'charakter', 'Váš charakter musí být realistický a zapadat do prostředí serveru.', 0),
('roleplay', 'charakter', 'Jména postav musí být realistická (žádné trolling nebo meme jména).', 1),
('roleplay', 'charakter', 'Každý charakter má svou vlastní identitu a nesmí sdílet informace mezi sebou.', 2),
('roleplay', 'charakter', 'Character development je důležitý - vaše postava by měla růst a vyvíjet se.', 3),

-- Roleplay pravidla - Interakce
('roleplay', 'interakce', 'Vždy hrajte role první, střelba až jako poslední možnost.', 0),
('roleplay', 'interakce', 'Musíte dát druhé straně možnost reagovat před akcí.', 1),
('roleplay', 'interakce', 'Žádné Random Deathmatch (RDM) - vždy musí být roleplay důvod.', 2),
('roleplay', 'interakce', 'Žádné Vehicle Deathmatch (VDM) - úmyslné taranění.', 3),
('roleplay', 'interakce', 'Powergaming je zakázáno - nemůžete nutit ostatní do akcí.', 4),
('roleplay', 'interakce', 'Metagaming je zakázáno - používání informací mimo charakter.', 5),

-- Vozidla - Silniční provoz
('vozidla', 'provoz', 'Dodržujte základní dopravní pravidla a rychlostní limity.', 0),
('vozidla', 'provoz', 'Semafory a dopravní značky jsou povinné dodržovat.', 1),
('vozidla', 'provoz', 'Při nehodě se zastavte a poskytněte pomoc.', 2),
('vozidla', 'provoz', 'Používejte indikátory a jízdu v pruzích.', 3),

-- Vozidla - Kradené vozidla
('vozidla', 'kradenice', 'Kradené vozidlo nesmíte parkovat ve vašem vlastním garážích.', 0),
('vozidla', 'kradenice', 'Po krádeži musíte vozidlo přestříkat nebo jinak upravit.', 1),
('vozidla', 'kradenice', 'Nelze krást vozidla přímo před jejich majiteli bez RP.', 2),

-- Zločin - Loupeže
('zlocin', 'loupezy', 'Loupež musí mít roleplay pozadí a důvod.', 0),
('zlocin', 'loupezy', 'Nemůžete loupit stejné místo více než jednou za 60 minut.', 1),
('zlocin', 'loupezy', 'Při loupeži musíte počkat na reakci oběti.', 2),
('zlocin', 'loupezy', 'Banky a velké loupeže vyžadují minimálně 4 policisty online.', 3),

-- Zločin - Střelba
('zlocin', 'strelba', 'Střelba musí být vždy poslední možnost po roleplay.', 0),
('zlocin', 'strelba', 'Pokud jste střeleni, musíte hrát zranění.', 1),
('zlocin', 'strelba', 'New Life Rule - po smrti zapomenete události vedoucí k smrti.', 2),
('zlocin', 'strelba', 'Nemůžete se vrátit na místo kde jste zemřeli alespoň 30 minut.', 3)
ON DUPLICATE KEY UPDATE 
content = VALUES(content),
order_index = VALUES(order_index);

-- Insert sample activities (based on existing hardcoded data)
INSERT INTO activities (nazev, popis, obrazek, odmena, vzdalenost, cas, riziko, riziko_level, category, span, gradient, border_color, glow_color, order_index) VALUES
(
    'Kamionová přeprava',
    'Přepravujte různé druhy nákladu mezi sklady po celém městě. Odměna se vypočítává podle uražené vzdálenosti.',
    '/aktivity/kamion.png',
    '187 – 784',
    '1.9 – 7.8 km',
    'Záleží na trase',
    'Žádné (Legální Aktivita)',
    'low',
    'legal',
    1,
    'from-green-500/20 via-emerald-500/10 to-green-600/20',
    'border-green-500/30',
    'shadow-green-500/20',
    0
),
(
    'Vloupačka do domu',
    'Vykradení soukromých domů. Vyžaduje lockpick a trvá 5 min. Po skončení se dveře automaticky zamknou.',
    '/aktivity/robhouse.png',
    'Různé položky (peníze, šperky, zbraně)',
    NULL,
    'Max. 5 min',
    'Vysoké',
    'high',
    'illegal',
    1,
    'from-orange-500/20 via-amber-500/10 to-orange-600/20',
    'border-orange-500/30',
    'shadow-orange-500/20',
    1
),
(
    'Krádež vozidla s lokátorem',
    'Vozidlo je označeno GPS lokátorem. Nejprve hackněte zařízení, poté doručte auto do vyznačeného místa do 20 min, jinak odměna propadne.',
    '/aktivity/lokator.png',
    '2,000 – 16,000',
    NULL,
    '20 min',
    'Vysoké',
    'high',
    'illegal',
    1,
    'from-red-500/20 via-rose-500/10 to-red-600/20',
    'border-red-500/30',
    'shadow-red-500/20',
    2
),
(
    'Loupež klenotnictví',
    'Vykrádež vitrín v klenotnictví. Vyžaduje vyšší počet policistů pro vyváženou ekonomiku a alarm trvá 2 min.',
    '/aktivity/kleno.png',
    '3 - 7 exkluzivních klenotů v každé sekci',
    NULL,
    'Max. 20 min',
    'Extrémní',
    'extreme',
    'heist',
    2,
    'from-yellow-500/20 via-amber-500/10 to-yellow-600/20',
    'border-yellow-500/30',
    'shadow-yellow-500/20',
    3
),
(
    'Přepadení prodejny',
    'Vniknutí do kamenné prodejny (elektro, oděvy či stánek s alkoholem). Akce trvá maximálně 10 minut, bezpečnostní zámek se aktivuje za 40 s.',
    '/aktivity/robshop.png',
    '500 – 850 za zásah',
    NULL,
    'až 10 min',
    'střední',
    'medium',
    'illegal',
    1,
    'from-purple-500/20 via-violet-500/10 to-purple-600/20',
    'border-purple-500/30',
    'shadow-purple-500/20',
    4
),
(
    'Loupež bankomatu',
    'Hacking nebo odpálení bankomatu. Zpráva o výbuchu spustí dispatch. ATM se obnoví po 10 min.',
    '/aktivity/robatm.png',
    '150 – 250',
    NULL,
    '5 – 10 min',
    'Střední',
    'medium',
    'illegal',
    1,
    'from-blue-500/20 via-cyan-500/10 to-blue-600/20',
    'border-blue-500/30',
    'shadow-blue-500/20',
    5
),
(
    'Loupež banky',
    'Vykradení bankomatu nebo trezoru v bance. Vyžaduje přístupový čip, trvá až 60 min.',
    '/aktivity/robbank.png',
    '800 × 40 pauz',
    NULL,
    'Max. 60 min',
    'Extrémní',
    'extreme',
    'heist',
    2,
    'from-red-600/30 via-rose-600/20 to-red-700/30',
    'border-red-600/40',
    'shadow-red-600/30',
    6
)
ON DUPLICATE KEY UPDATE 
nazev = VALUES(nazev),
popis = VALUES(popis); 