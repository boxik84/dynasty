-- Add serial_number column to whitelist_requests table
ALTER TABLE whitelist_requests 
ADD COLUMN serial_number VARCHAR(20) UNIQUE NULL AFTER id;

-- Create index for serial_number for better performance
CREATE INDEX idx_whitelist_serial_number ON whitelist_requests(serial_number);

-- Update existing records with serial numbers
-- Generate serial numbers in format WL-YYYY-NNNN where YYYY is year and NNNN is sequential number
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