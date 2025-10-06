-- Migration: Create complete whitelist_requests table with all columns
-- Date: 2025-01-15 13:00:00

-- Drop table if exists (for clean migration)
DROP TABLE IF EXISTS whitelist_requests;

-- Create complete whitelist_requests table with all features
CREATE TABLE whitelist_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    serial_number VARCHAR(20) UNIQUE NULL,
    notes TEXT NULL,
    user_id VARCHAR(255) NOT NULL,
    form_data JSON NOT NULL,
    status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_serial_number (serial_number),
    INDEX idx_created_at (created_at),
    INDEX idx_updated_at (updated_at),
    INDEX idx_notes (notes(255)),
    INDEX idx_user_status (user_id, status),
    INDEX idx_status_created (status, created_at)
);

-- Insert sample data for testing
INSERT INTO whitelist_requests (user_id, form_data, status, serial_number) VALUES
('test_user_1', '{"discordName": "testuser1", "age": "25", "steamProfile": "https://steamcommunity.com/id/testuser1", "fivemHours": "500 hodin", "whyJoinServer": "Chci hrát roleplay"}', 'pending', 'WL-2025-0001'),
('test_user_2', '{"discordName": "testuser2", "age": "30", "steamProfile": "https://steamcommunity.com/id/testuser2", "fivemHours": "1000 hodin", "whyJoinServer": "Doporučení od kamaráda"}', 'approved', 'WL-2025-0002'),
('test_user_3', '{"discordName": "testuser3", "age": "22", "steamProfile": "https://steamcommunity.com/id/testuser3", "fivemHours": "200 hodin", "whyJoinServer": "Zajímá mě roleplay"}', 'rejected', 'WL-2025-0003');

-- Generate serial numbers for any records without them
-- Format: WL-YYYY-NNNN where YYYY is year and NNNN is sequential number
SET @serial_counter = 0;
UPDATE whitelist_requests 
SET serial_number = CONCAT(
    'WL-', 
    YEAR(created_at), 
    '-', 
    LPAD((@serial_counter := @serial_counter + 1), 4, '0')
)
WHERE serial_number IS NULL
ORDER BY created_at ASC; 