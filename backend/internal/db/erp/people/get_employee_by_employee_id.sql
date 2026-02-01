-- name: GetEmployeeByEmployeeID :one
SELECT *
FROM employees
WHERE
    employee_id = $1
    AND tenant_id = $2
LIMIT 1;