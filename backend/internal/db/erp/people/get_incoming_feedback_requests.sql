-- name: GetIncomingFeedbackRequests :many
SELECT
    id,
    employee_id,
    reviewer_id,
    cycle_id,
    status,
    review_type,
    created_at
FROM performance_reviews
WHERE
    reviewer_id = $1
    AND review_type = 'peer'
    AND status IN ('pending', 'in_progress')
ORDER BY created_at DESC;