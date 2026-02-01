-- name: ListJobPostings :many
SELECT
    id,
    title,
    description,
    status,
    created_at
FROM job_postings
WHERE
    tenant_id = $1;