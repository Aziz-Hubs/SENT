-- name: GetEmployeeReviews :many
SELECT
    r.*,
    c.name as cycle_name,
    e.first_name as reviewer_first_name,
    e.last_name as reviewer_last_name
FROM
    performance_reviews r
    LEFT JOIN review_cycles c ON r.cycle_id = c.id
    LEFT JOIN employees e ON r.reviewer_id = e.id
WHERE
    r.employee_id = $1
ORDER BY r.created_at DESC;