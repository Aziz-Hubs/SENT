-- name: CreateAccount :one
INSERT INTO
    accounts (
        tenant_id,
        name,
        number,
        type,
        balance,
        is_intercompany
    )
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING
    id;