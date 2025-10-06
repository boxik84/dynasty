-- Add notes column to whitelist_requests table for admin comments
ALTER TABLE whitelist_requests 
ADD COLUMN notes TEXT NULL AFTER serial_number;
 
-- Create index for better performance when searching by notes
CREATE INDEX idx_whitelist_notes ON whitelist_requests(notes(255)); 