-- +goose Up
CREATE TABLE tenants (
    org_id TEXT PRIMARY KEY,
    db_name TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    domain TEXT NOT NULL,
    tier TEXT NOT NULL,
    auth_type TEXT NOT NULL,
    region TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'provisioning',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- +goose Down
DROP TABLE tenants;
