-- Migration: 006_rustdesk_setup
-- Description: Add remote access metadata to devices table

ALTER TABLE devices
ADD COLUMN IF NOT EXISTS rustdesk_id VARCHAR(50),
ADD COLUMN IF NOT EXISTS rustdesk_password VARCHAR(100);

-- Also add a column for general remote access settings if needed in future
ALTER TABLE devices
ADD COLUMN IF NOT EXISTS remote_access_enabled BOOLEAN DEFAULT FALSE;