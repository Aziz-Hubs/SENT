-- name: CreateApplication :one
INSERT INTO
    applications (
        tenant_id,
        job_posting_id,
        candidate_id,
        status
    )
VALUES ($1, $2, $3, 'new')
RETURNING
    *;