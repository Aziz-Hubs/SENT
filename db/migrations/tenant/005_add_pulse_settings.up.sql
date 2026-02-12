-- Migration 005: Add pulse_settings table for configurable thresholds

CREATE TABLE IF NOT EXISTS pulse_settings (
    organization_id UUID PRIMARY KEY,
    cpu_threshold FLOAT DEFAULT 90.0,
    memory_threshold FLOAT DEFAULT 90.0,
    disk_threshold FLOAT DEFAULT 90.0,
    offline_threshold_minutes INT DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed defaults for the first organization (from pulse-client.ts)
INSERT INTO
    pulse_settings (organization_id)
VALUES (
        '42318d05-0d38-4fc7-9163-4ba8565d68f0'
    )
ON CONFLICT (organization_id) DO NOTHING;