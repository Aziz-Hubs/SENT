-- name: GetActiveReviewCycle :one
SELECT id
FROM review_cycles
WHERE
    tenant_id = $1
    AND status = 'active'
LIMIT 1;