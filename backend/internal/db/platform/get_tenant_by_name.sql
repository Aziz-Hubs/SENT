-- name: GetTenantByName :one
SELECT id FROM tenants WHERE name = $1;