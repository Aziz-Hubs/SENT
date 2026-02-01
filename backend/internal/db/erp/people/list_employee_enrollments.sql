-- name: ListEmployeeEnrollments :many
SELECT e.*, p.name as plan_name, p.type as plan_type
FROM
    benefit_enrollments e
    JOIN benefit_plans p ON e.benefit_plan_id = p.id
WHERE
    e.employee_id = $1;