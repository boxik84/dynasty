-- Migration: Create simple whitelist_requests table
-- Date: 2025-01-15 12:00:00

-- Drop table if exists
DROP TABLE IF EXISTS whitelist_requests;

-- Create whitelist_requests table
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
    INDEX idx_notes (notes(255))
);

-- Generate serial numbers for existing records (if any)
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