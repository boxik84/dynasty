-- Migration: Create whitelist questions configuration table
-- Date: 2025-01-16 14:00:00

-- Create whitelist_questions table
CREATE TABLE IF NOT EXISTS whitelist_questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question TEXT NOT NULL,
    field_name VARCHAR(100) NOT NULL UNIQUE,
    field_type ENUM('text', 'textarea', 'number', 'checkbox', 'url', 'select') NOT NULL DEFAULT 'text',
    placeholder VARCHAR(255),
    required BOOLEAN DEFAULT TRUE,
    category VARCHAR(50) DEFAULT 'general',
    options JSON,
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

-- Insert default whitelist questions based on current form
INSERT INTO whitelist_questions (question, field_name, field_type, placeholder, required, category, min_value, max_value, min_length, order_index) VALUES

-- Základní informace
('Discord jméno (např. jakuubboss)', 'discordName', 'text', 'jakuubboss', TRUE, 'basic', NULL, NULL, 2, 1),
('Tvůj věk', 'age', 'number', '18', TRUE, 'basic', 15, 99, NULL, 2),
('Odkaz na Steam profil', 'steamProfile', 'url', 'https://steamcommunity.com/id/...', TRUE, 'basic', NULL, NULL, 10, 3),
('Kolik máš odehraných hodin na FiveM?', 'fivemHours', 'text', 'např. 500 hodin', TRUE, 'basic', NULL, NULL, 5, 4),

-- Motivace
('Proč si chceš zahrát na našem serveru?', 'whyJoinServer', 'textarea', 'Popište své důvody...', TRUE, 'motivation', NULL, NULL, 50, 5),
('Jak jsi se o nás dozvěděl?', 'howFoundUs', 'textarea', 'Youtube, Discord, doporučení...', TRUE, 'motivation', NULL, NULL, 20, 6),

-- Roleplay znalosti
('Co je to Roleplay?', 'whatIsRoleplay', 'textarea', 'Vysvětlete svojimi slovy...', TRUE, 'roleplay', NULL, NULL, 50, 7),
('Vysvětli rozdíl mezi IC a OOC', 'icVsOoc', 'textarea', 'In Character vs Out of Character...', TRUE, 'roleplay', NULL, NULL, 50, 8),
('K čemu slouží příkaz /me?', 'meCommand', 'textarea', 'Vysvětlete účel a použití...', TRUE, 'roleplay', NULL, NULL, 30, 9),
('K čemu slouží příkaz /do a co se do /do nesmí psát?', 'doCommand', 'textarea', 'Vysvětlete účel a omezení...', TRUE, 'roleplay', NULL, NULL, 30, 10),

-- Pravidla - základní pojmy
('Co je to KOS?', 'whatIsKos', 'textarea', 'Kill on Sight - vysvětlete...', TRUE, 'rules_basic', NULL, NULL, 30, 11),
('Co je to METAGAMING?', 'whatIsMetagaming', 'textarea', 'Definice a příklady...', TRUE, 'rules_basic', NULL, NULL, 30, 12),
('Co je to MIXING?', 'whatIsMixing', 'textarea', 'Vysvětlete pojem...', TRUE, 'rules_basic', NULL, NULL, 30, 13),
('Co je to POWERGAMING?', 'whatIsPowergaming', 'textarea', 'Definice a příklady...', TRUE, 'rules_basic', NULL, NULL, 30, 14),
('Co je to FEAR RP?', 'fearRp', 'textarea', 'Vysvětlete pojem...', TRUE, 'rules_basic', NULL, NULL, 30, 15),

-- Pravidla - pokročilé
('Co je to GROSS RP?', 'grossRp', 'textarea', 'Definice a co je zakázáno...', TRUE, 'rules_advanced', NULL, NULL, 30, 16),
('Smíš se po smrti teleportovat do vody za účelem úniku? Proč?', 'waterEvading', 'textarea', 'Ano/Ne a zdůvodnění...', TRUE, 'rules_advanced', NULL, NULL, 30, 17),
('Co je to COP BAITING?', 'copBaiting', 'textarea', 'Definice a příklady...', TRUE, 'rules_advanced', NULL, NULL, 30, 18),
('Co je to PASSIVE RP?', 'passiveRp', 'textarea', 'Vysvětlete pojem...', TRUE, 'rules_advanced', NULL, NULL, 30, 19),
('Co je to NVL?', 'nvl', 'textarea', 'No Value of Life - vysvětlete...', TRUE, 'rules_advanced', NULL, NULL, 30, 20),
('Co je to VDM?', 'vdm', 'textarea', 'Vehicle Death Match - definice...', TRUE, 'rules_advanced', NULL, NULL, 30, 21),
('Co je to RDM?', 'rdm', 'textarea', 'Random Death Match - definice...', TRUE, 'rules_advanced', NULL, NULL, 30, 22),
('Co je to ADVERTISING?', 'advertising', 'textarea', 'Definice a pravidla...', TRUE, 'rules_advanced', NULL, NULL, 30, 23),
('Co je to FAIL RP?', 'failRp', 'textarea', 'Vysvětlete pojem...', TRUE, 'rules_advanced', NULL, NULL, 30, 24),
('Co je to LOOTBOXING?', 'lootboxing', 'textarea', 'Definice a pravidla...', TRUE, 'rules_advanced', NULL, NULL, 30, 25),
('Smíš okrádat hráče pokud ho zabiješ? Proč?', 'robbery', 'textarea', 'Ano/Ne a zdůvodnění...', TRUE, 'rules_advanced', NULL, NULL, 30, 26),
('Můžeš prohledávat inventář hráče bez jeho vědomí?', 'inventory', 'textarea', 'Ano/Ne a vysvětlení...', TRUE, 'rules_advanced', NULL, NULL, 30, 27),
('Co je to PK?', 'pk', 'textarea', 'Player Kill - vysvětlete...', TRUE, 'rules_advanced', NULL, NULL, 30, 28),
('Co je to CK?', 'ck', 'textarea', 'Character Kill - vysvětlete...', TRUE, 'rules_advanced', NULL, NULL, 30, 29),
('Co je to RVDM?', 'rvdm', 'textarea', 'Revenge VDM - definice...', TRUE, 'rules_advanced', NULL, NULL, 30, 30),
('Smíš se po boji vrátit do oblasti kde jsi zemřel?', 'combatComeback', 'textarea', 'Ano/Ne a pravidla...', TRUE, 'rules_advanced', NULL, NULL, 30, 31),

-- Specifická pravidla
('Co je zakázáno psát v Spraying?', 'sprayingRules', 'textarea', 'Vyjmenujte zakázané obsahy...', TRUE, 'specific_rules', NULL, NULL, 30, 32),
('Jak funguje rozpoznání osoby podle hlasu?', 'personRecognition', 'textarea', 'Pravidla rozpoznávání...', TRUE, 'specific_rules', NULL, NULL, 30, 33),
('Pravidlo únosu - jaká je maximální doba a kam je zakázáno unášet osobu/y?', 'kidnappingRules', 'textarea', 'Časové limity a zakázané lokace...', TRUE, 'specific_rules', NULL, NULL, 50, 34),

-- Scénáře
('Scénář 1: Jdeš po ulici a někdo ti ukradne peněženku. Co uděláš? Jak to zahraješ?', 'scenario1', 'textarea', 'Popište své roleplay řešení...', TRUE, 'scenarios', NULL, NULL, 100, 35),
('Scénář 2: Spatříš nehodu, kde je zraněná osoba. Co uděláš? Jak to zahraješ?', 'scenario2', 'textarea', 'Popište své roleplay řešení...', TRUE, 'scenarios', NULL, NULL, 100, 36),

-- Souhlas
('Souhlasím s pravidly serveru', 'rules', 'checkbox', NULL, TRUE, 'agreement', NULL, NULL, NULL, 37)

ON DUPLICATE KEY UPDATE 
question = VALUES(question),
field_type = VALUES(field_type),
placeholder = VALUES(placeholder),
required = VALUES(required),
category = VALUES(category); 