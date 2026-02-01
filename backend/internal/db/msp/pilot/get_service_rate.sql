-- name: GetServiceRate :one
SELECT rate
FROM service_rates
WHERE
    tenant_id = $1
    AND work_type = $2
LIMIT 1;