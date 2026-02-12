-- name: ListDevices :many
SELECT *
FROM devices
WHERE
    organization_id = $1
ORDER BY name ASC
LIMIT $2
OFFSET
    $3;

-- name: CountDevices :one
SELECT COUNT(*) FROM devices WHERE organization_id = $1;

-- name: GetDevice :one
SELECT * FROM devices WHERE id = $1;

-- name: GetDevicesByStatus :many
SELECT *
FROM devices
WHERE
    organization_id = $1
    AND status = $2
ORDER BY name ASC;

-- name: CreateDevice :one
INSERT INTO
    devices (
        organization_id,
        site_id,
        name,
        type,
        status,
        os,
        os_version,
        ip,
        cpu_usage,
        memory_usage,
        disk_usage,
        tags,
        client,
        site
    )
VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8,
        $9,
        $10,
        $11,
        $12,
        $13,
        $14
    )
RETURNING
    *;

-- name: UpdateDeviceStatus :exec
UPDATE devices
SET
    status = $2,
    last_seen = NOW(),
    updated_at = NOW()
WHERE
    id = $1;

-- name: UpdateDeviceTelemetry :exec
UPDATE devices
SET
    cpu_usage = $2,
    memory_usage = $3,
    disk_usage = $4,
    last_seen = NOW(),
    updated_at = NOW()
WHERE
    id = $1;

-- name: DeleteDevice :exec
DELETE FROM devices WHERE id = $1;

-- name: GetDeviceStats :one
SELECT
    COUNT(*) as total_devices,
    COUNT(*) FILTER (
        WHERE
            status = 'online'
    ) as online,
    COUNT(*) FILTER (
        WHERE
            status = 'offline'
    ) as offline,
    COUNT(*) FILTER (
        WHERE
            status = 'warning'
    ) as warning
FROM devices
WHERE
    organization_id = $1;

-- name: ListAlerts :many
SELECT *
FROM alerts
WHERE
    organization_id = $1
ORDER BY created_at DESC
LIMIT $2
OFFSET
    $3;

-- name: ListUnresolvedAlerts :many
SELECT *
FROM alerts
WHERE
    organization_id = $1
    AND resolved = FALSE
ORDER BY created_at DESC
LIMIT $2;

-- name: CountCriticalAlerts :one
SELECT COUNT(*)
FROM alerts
WHERE
    organization_id = $1
    AND severity = 'critical'
    AND acknowledged = FALSE;

-- name: GetAlert :one
SELECT * FROM alerts WHERE id = $1;

-- name: CreateAlert :one
INSERT INTO
    alerts (
        organization_id,
        device_id,
        device_name,
        severity,
        title,
        description
    )
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING
    *;

-- name: AcknowledgeAlert :exec
UPDATE alerts
SET
    acknowledged = TRUE,
    acknowledged_by = $2,
    acknowledged_at = NOW()
WHERE
    id = $1;

-- name: ResolveAlert :exec
UPDATE alerts SET resolved = TRUE, resolved_at = NOW() WHERE id = $1;

-- name: DeleteAlert :exec
DELETE FROM alerts WHERE id = $1;

-- name: ListScripts :many
SELECT * FROM scripts WHERE organization_id = $1 ORDER BY name ASC;

-- name: GetScript :one
SELECT * FROM scripts WHERE id = $1;

-- name: CreateScript :one
INSERT INTO
    scripts (
        organization_id,
        name,
        description,
        language,
        content,
        tags,
        created_by
    )
VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING
    *;

-- name: UpdateScript :exec
UPDATE scripts
SET
    name = $2,
    description = $3,
    language = $4,
    content = $5,
    tags = $6,
    updated_at = NOW()
WHERE
    id = $1;

-- name: UpdateScriptLastRun :exec
UPDATE scripts SET last_run = NOW(), success_rate = $2 WHERE id = $1;

-- name: DeleteScript :exec
DELETE FROM scripts WHERE id = $1;