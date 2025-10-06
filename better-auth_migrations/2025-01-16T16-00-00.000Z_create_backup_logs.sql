-- Migration: Create backup logs table
-- Date: 2025-01-16 16:00:00

-- Create backup_logs table for tracking database backups
CREATE TABLE IF NOT EXISTS backup_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type ENUM('full', 'structure', 'data') NOT NULL DEFAULT 'full',
    filename VARCHAR(255) NOT NULL,
    file_size DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT 'File size in MB',
    status ENUM('running', 'completed', 'failed') NOT NULL DEFAULT 'running',
    error_message TEXT NULL,
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_created_by (created_by),
    INDEX idx_created_at (created_at),
    INDEX idx_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Backup operation logs'; 