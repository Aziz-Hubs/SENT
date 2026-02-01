-- name: GetEmployeeByID :one
SELECT * FROM employees WHERE id = $1 LIMIT 1;