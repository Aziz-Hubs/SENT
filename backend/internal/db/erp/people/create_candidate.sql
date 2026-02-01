-- name: CreateCandidate :one
INSERT INTO
    candidates (
        tenant_id,
        first_name,
        last_name,
        email
    )
VALUES ($1, $2, $3, $4)
RETURNING
    id;