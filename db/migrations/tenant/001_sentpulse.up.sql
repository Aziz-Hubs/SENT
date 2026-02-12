-- SENTpulse MVP Database Schema
-- Migration: 001_sentpulse

-- ============================================================================
-- DEVICES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    organization_id UUID NOT NULL,
    site_id UUID,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL DEFAULT 'workstation', -- 'server', 'workstation', 'network', 'iot'
    status VARCHAR(20) NOT NULL DEFAULT 'offline', -- 'online', 'offline', 'warning', 'maintenance'
    os VARCHAR(20) NOT NULL, -- 'windows', 'linux', 'macos'
    os_version VARCHAR(100),
    ip VARCHAR(45), -- IPv4 or IPv6
    last_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    cpu_usage REAL DEFAULT 0,
    memory_usage REAL DEFAULT 0,
    disk_usage REAL DEFAULT 0,
    tags TEXT [] DEFAULT '{}',
    client VARCHAR(255),
    site VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_devices_organization ON devices (organization_id);

CREATE INDEX IF NOT EXISTS idx_devices_status ON devices (status);

CREATE INDEX IF NOT EXISTS idx_devices_last_seen ON devices (last_seen DESC);

CREATE INDEX IF NOT EXISTS idx_devices_client ON devices (client);

-- ============================================================================
-- ALERTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    organization_id UUID NOT NULL,
    device_id UUID NOT NULL REFERENCES devices (id) ON DELETE CASCADE,
    device_name VARCHAR(255) NOT NULL,
    severity VARCHAR(20) NOT NULL, -- 'info', 'warning', 'critical'
    title VARCHAR(255) NOT NULL,
    description TEXT,
    acknowledged BOOLEAN NOT NULL DEFAULT FALSE,
    acknowledged_by UUID,
    acknowledged_at TIMESTAMPTZ,
    resolved BOOLEAN NOT NULL DEFAULT FALSE,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alerts_organization ON alerts (organization_id);

CREATE INDEX IF NOT EXISTS idx_alerts_device ON alerts (device_id);

CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts (severity);

CREATE INDEX IF NOT EXISTS idx_alerts_unresolved ON alerts (organization_id)
WHERE
    resolved = FALSE;

CREATE INDEX IF NOT EXISTS idx_alerts_created ON alerts (created_at DESC);

-- ============================================================================
-- SCRIPTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS scripts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    organization_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    language VARCHAR(20) NOT NULL, -- 'powershell', 'bash', 'python'
    content TEXT NOT NULL DEFAULT '',
    last_run TIMESTAMPTZ,
    success_rate INTEGER DEFAULT 0, -- 0-100
    tags TEXT [] DEFAULT '{}',
    created_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scripts_organization ON scripts (organization_id);

CREATE INDEX IF NOT EXISTS idx_scripts_language ON scripts (language);

-- ============================================================================
-- SCRIPT EXECUTIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS script_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    script_id UUID REFERENCES scripts (id) ON DELETE SET NULL,
    device_id UUID NOT NULL REFERENCES devices (id) ON DELETE CASCADE,
    executed_by UUID,
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'running', 'success', 'failed'
    exit_code INTEGER,
    stdout TEXT,
    stderr TEXT,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_executions_device ON script_executions (device_id);

CREATE INDEX IF NOT EXISTS idx_executions_script ON script_executions (script_id);

CREATE INDEX IF NOT EXISTS idx_executions_status ON script_executions (status);