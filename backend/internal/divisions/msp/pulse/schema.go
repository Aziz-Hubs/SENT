package pulse

const TelemetrySchema = `
CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;

CREATE TABLE IF NOT EXISTS pulse_telemetry (
    time        TIMESTAMPTZ       NOT NULL,
    agent_id    UUID              NOT NULL,
    cpu_percent DOUBLE PRECISION  NULL,
    mem_total   BIGINT            NULL,
    mem_used    BIGINT            NULL,
    mem_free    BIGINT            NULL,
    load_1      DOUBLE PRECISION  NULL,
    load_5      DOUBLE PRECISION  NULL,
    load_15     DOUBLE PRECISION  NULL
);

-- Ensure it's a hypertable
SELECT create_hypertable('pulse_telemetry', 'time', if_not_exists => TRUE);

-- Create continuous aggregates for rollups
CREATE MATERIALIZED VIEW IF NOT EXISTS pulse_telemetry_hourly
WITH (timescaledb.continuous) AS
SELECT time_bucket('1 hour', time) AS bucket,
       agent_id,
       avg(cpu_percent) as avg_cpu,
       max(cpu_percent) as max_cpu,
       avg(mem_used) as avg_mem_used,
       max(mem_used) as max_mem_used
FROM pulse_telemetry
GROUP BY bucket, agent_id
WITH NO DATA;

CREATE MATERIALIZED VIEW IF NOT EXISTS pulse_telemetry_daily
WITH (timescaledb.continuous) AS
SELECT time_bucket('1 day', time) AS bucket,
       agent_id,
       avg(cpu_percent) as avg_cpu,
       max(cpu_percent) as max_cpu,
       avg(mem_used) as avg_mem_used,
       max(mem_used) as max_mem_used
FROM pulse_telemetry
GROUP BY bucket, agent_id
WITH NO DATA;
`
