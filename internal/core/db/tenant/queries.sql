-- name: CreateAuditLog :exec
INSERT INTO audit_logs (
  time, actor_id, module, action, target_resource, metadata
) VALUES (
  $1, $2, $3, $4, $5, $6
);

-- name: GetAuditLogs :many
SELECT * FROM audit_logs
WHERE time > $1
ORDER BY time DESC
LIMIT $2;

-- name: SetSystemSetting :exec
INSERT INTO system_settings (
  key, value, updated_at
) VALUES (
  $1, $2, NOW()
)
ON CONFLICT (key) DO UPDATE
SET value = $2, updated_at = NOW();

-- name: GetSystemSetting :one
SELECT * FROM system_settings
WHERE key = $1 LIMIT 1;
