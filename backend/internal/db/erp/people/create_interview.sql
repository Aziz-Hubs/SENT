-- name: CreateInterview :one
INSERT INTO
    interviews (
        tenant_id,
        application_id,
        scheduled_at,
        type
    )
VALUES ($1, $2, $3, $4)
RETURNING
    id;