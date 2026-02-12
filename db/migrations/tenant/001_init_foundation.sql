-- +goose Up
CREATE TABLE audit_logs (
    time TIMESTAMPTZ NOT NULL,
    actor_id TEXT NOT NULL,
    module TEXT NOT NULL,
    action TEXT NOT NULL,
    target_resource TEXT NOT NULL,
    metadata JSONB
);

-- Convert to hypertable
SELECT create_hypertable('audit_logs', 'time');

CREATE TABLE system_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- +goose Down
DROP TABLE audit_logs;
DROP TABLE system_settings;
