-- name: CreateScript :one
INSERT INTO
    scripts (
        tenant_id,
        name,
        description,
        content,
        type
    )
VALUES ($1, $2, $3, $4, $5)
RETURNING
    *;