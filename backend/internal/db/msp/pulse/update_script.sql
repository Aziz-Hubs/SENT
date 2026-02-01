-- name: UpdateScript :one
UPDATE scripts
SET
    name = $2,
    description = $3,
    content = $4,
    type = $5,
    updated_at = NOW()
WHERE
    id = $1
RETURNING
    *;