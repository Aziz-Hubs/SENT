-- Enable TimescaleDB extension if not exists
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- Convert ledger_entries to hypertable
-- Note: In a real environment, this might require dropping constraints or careful migration
SELECT create_hypertable('ledger_entries', 'created_at', if_not_exists => TRUE);

-- Create Hourly Aggregate for Ledger Data
CREATE MATERIALIZED VIEW IF NOT EXISTS ledger_hourly_summary
WITH (timescaledb.continuous) AS
SELECT 
    time_bucket('1 hour', created_at) AS bucket,
    tenant_id,
    account_id,
    direction,
    SUM(amount) AS total_amount,
    COUNT(*) AS entry_count
FROM ledger_entries
GROUP BY bucket, tenant_id, account_id, direction;

-- Create Daily Aggregate
CREATE MATERIALIZED VIEW IF NOT EXISTS ledger_daily_summary
WITH (timescaledb.continuous) AS
SELECT 
    time_bucket('1 day', created_at) AS bucket,
    tenant_id,
    account_id,
    direction,
    SUM(amount) AS total_amount
FROM ledger_entries
GROUP BY bucket, tenant_id, account_id, direction;

-- Create Monthly Aggregate
CREATE MATERIALIZED VIEW IF NOT EXISTS ledger_monthly_summary
WITH (timescaledb.continuous) AS
SELECT 
    time_bucket('1 month', created_at) AS bucket,
    tenant_id,
    account_id,
    direction,
    SUM(amount) AS total_amount
FROM ledger_entries
GROUP BY bucket, tenant_id, account_id, direction;

-- Add Refresh Policy
SELECT add_continuous_aggregate_policy('ledger_hourly_summary',
    start_offset => INTERVAL '1 month',
    end_offset => INTERVAL '1 hour',
    schedule_interval => INTERVAL '1 hour');