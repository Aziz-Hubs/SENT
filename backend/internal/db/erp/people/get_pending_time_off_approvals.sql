-- name: GetPendingTimeOffApprovals :many
SELECT r.id, r.employee_id, r.type, r.start_date, r.end_date, r.status, e.first_name, e.last_name
FROM
    time_off_requests r
    JOIN employees e ON r.employee_id = e.id
WHERE
    e.manager_id = $1
    AND r.status = 'PENDING'
ORDER BY r.start_date ASC;