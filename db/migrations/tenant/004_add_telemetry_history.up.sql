-- Convert to hypertable for TimescaleDB
-- SELECT create_hypertable (
--         'device_telemetry', 'time', if_not_exists => TRUE
--     );

-- Index for efficient querying by device and time
CREATE INDEX IF NOT EXISTS idx_telemetry_device_time ON device_telemetry (device_id, time DESC);