-- name: GetFirstTenant :one
SELECT
    id,
    name,
    identifier,
    domain,
    transaction_limit,
    is_active
FROM tenants
LIMIT 1;