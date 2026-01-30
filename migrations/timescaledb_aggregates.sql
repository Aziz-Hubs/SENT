-- Convert journal_entries to a hypertable
SELECT create_hypertable('journal_entries', 'created_at', if_not_exists => TRUE);

-- Hourly continuous aggregate for P&L and Balance Sheet
CREATE MATERIALIZED VIEW journal_entries_hourly
WITH (timescaledb.continuous) AS
SELECT
  time_bucket('1 hour', created_at) AS bucket,
  tenant_id,
  account_id,
  direction,
  sum(amount) as total_amount,
  count(*) as transaction_count
FROM journal_entries
GROUP BY bucket, tenant_id, account_id, direction
WITH NO DATA;

-- Daily continuous aggregate
CREATE MATERIALIZED VIEW journal_entries_daily
WITH (timescaledb.continuous) AS
SELECT
  time_bucket('1 day', created_at) AS bucket,
  tenant_id,
  account_id,
  direction,
  sum(amount) as total_amount,
  count(*) as transaction_count
FROM journal_entries
GROUP BY bucket, tenant_id, account_id, direction
WITH NO DATA;

-- Monthly continuous aggregate
CREATE MATERIALIZED VIEW journal_entries_monthly
WITH (timescaledb.continuous) AS
SELECT
  time_bucket('1 month', created_at) AS bucket,
  tenant_id,
  account_id,
  direction,
  sum(amount) as total_amount,
  count(*) as transaction_count
FROM journal_entries
GROUP BY bucket, tenant_id, account_id, direction
WITH NO DATA;

-- Refresh policies
SELECT add_continuous_aggregate_policy('journal_entries_hourly',
  start_offset => INTERVAL '1 month',
  end_offset => INTERVAL '1 hour',
  schedule_interval => INTERVAL '1 hour');

SELECT add_continuous_aggregate_policy('journal_entries_daily',
  start_offset => INTERVAL '1 year',
  end_offset => INTERVAL '1 day',
  schedule_interval => INTERVAL '1 day');

SELECT add_continuous_aggregate_policy('journal_entries_monthly',
  start_offset => INTERVAL '10 years',
  end_offset => INTERVAL '1 month',
  schedule_interval => INTERVAL '1 day');
