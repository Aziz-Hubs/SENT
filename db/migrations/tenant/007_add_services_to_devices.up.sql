-- Migration: 007_add_services_to_devices
-- Description: Adds services column to devices table

ALTER TABLE devices
ADD COLUMN IF NOT EXISTS services JSONB DEFAULT '[]';