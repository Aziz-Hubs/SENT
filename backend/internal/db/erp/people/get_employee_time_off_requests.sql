-- name: GetEmployeeTimeOffRequests :many
SELECT
    id,
    employee_id,
    type,
    start_date,
    end_date,
    status,
    created_at
FROM time_off_requests
WHERE
    employee_id = $1
ORDER BY created_at DESC;