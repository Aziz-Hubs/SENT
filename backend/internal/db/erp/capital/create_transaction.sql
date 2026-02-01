-- name: CreateTransaction :one
INSERT INTO
    transactions (
        tenant_id,
        description,
        date,
        total_amount
    )
VALUES ($1, $2, $3, $4)
RETURNING
    id;