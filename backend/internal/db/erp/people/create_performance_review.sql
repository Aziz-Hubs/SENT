-- name: CreatePerformanceReview :one
INSERT INTO
    performance_reviews (
        tenant_id,
        employee_id,
        reviewer_id,
        cycle_id,
        status,
        review_type
    )
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING
    id;