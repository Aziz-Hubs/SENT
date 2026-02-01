-- name: GetEmployeeGoals :many
SELECT *
FROM goals
WHERE
    employee_id = $1
ORDER BY target_date ASC;