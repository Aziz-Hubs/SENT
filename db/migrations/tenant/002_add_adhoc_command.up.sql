-- Migration: 002_add_adhoc_command
-- Adds support for ad-hoc commands (e.g. reboot, shutdown, inline scripts)
-- to the script_executions table.

ALTER TABLE script_executions
ADD COLUMN IF NOT EXISTS adhoc_command TEXT,
ADD COLUMN IF NOT EXISTS adhoc_language VARCHAR(20);