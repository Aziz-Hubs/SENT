-- Migration: 007_add_services_to_devices
-- Description: Removes services column from devices table

ALTER TABLE devices DROP COLUMN IF EXISTS services;