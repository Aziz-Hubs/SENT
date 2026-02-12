-- name: CreateTenant :one
INSERT INTO
    tenants (
        org_id,
        db_name,
        name,
        domain,
        tier,
        auth_type,
        region,
        status
    )
VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8
    )
RETURNING
    *;

-- name: GetTenantByOrgID :one
SELECT * FROM tenants WHERE org_id = $1 LIMIT 1;

-- name: GetTenantByDBName :one
SELECT * FROM tenants WHERE db_name = $1 LIMIT 1;

-- name: ListTenants :many
SELECT * FROM tenants ORDER BY created_at DESC;

-- name: UpdateTenantStatus :exec
UPDATE tenants SET status = $1 WHERE org_id = $2;

-- name: DeleteTenant :exec
DELETE FROM tenants WHERE org_id = $1;