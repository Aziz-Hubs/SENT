-- name: CreateTenant :one
INSERT INTO
    tenants (
        name,
        identifier,
        domain,
        transaction_limit,
        is_active
    )
VALUES ($1, $2, $3, $4, $5)
RETURNING
    id;