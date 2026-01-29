package nexus

const NexusSchema = `
-- Create hypertable for nexus_audits if TimescaleDB is available
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'timescaledb') THEN
        IF NOT EXISTS (SELECT 1 FROM _timescaledb_catalog.hypertable WHERE table_name = 'nexus_audits') THEN
            PERFORM create_hypertable('nexus_audits', 'timestamp', if_not_exists => TRUE);
        END IF;

        -- Continuous Aggregates for Pulse Telemetry
        IF NOT EXISTS (SELECT 1 FROM pg_matviews WHERE matviewname = 'pulse_telemetry_hourly') THEN
            CREATE MATERIALIZED VIEW pulse_telemetry_hourly
            WITH (timescaledb.continuous) AS
            SELECT time_bucket('1 hour', time) AS bucket,
                   agent_id,
                   avg(cpu_percent) as avg_cpu,
                   max(cpu_percent) as max_cpu
            FROM pulse_telemetry
            GROUP BY bucket, agent_id;
        END IF;
    END IF;
END $$;
`
