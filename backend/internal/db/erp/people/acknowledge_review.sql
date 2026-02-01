-- name: AcknowledgeReview :exec
UPDATE performance_reviews
SET
    status = 'acknowledged',
    acknowledged_at = $2,
    updated_at = NOW()
WHERE
    id = $1;