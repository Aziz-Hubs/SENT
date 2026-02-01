-- name: GetActiveBlockContract :one
SELECT id
FROM contracts
WHERE
    tenant_id = $1
    AND status = 'active'
LIMIT 1;