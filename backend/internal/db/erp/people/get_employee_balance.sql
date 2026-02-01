-- name: GetEmployeeBalance :many
SELECT b.id, b.employee_id, b.year, b.balance, p.name as policy_name, p.leave_type
FROM
    time_off_balances b
    JOIN time_off_policies p ON b.policy_id = p.id
WHERE
    b.employee_id = $1
    AND b.year = $2;