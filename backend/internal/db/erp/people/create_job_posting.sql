-- name: CreateJobPosting :one
INSERT INTO
    job_postings (
        tenant_id,
        title,
        description,
        status
    )
VALUES ($1, $2, $3, 'draft')
RETURNING
    id;