-- name: CreateGoal :one
INSERT INTO
    goals (
        tenant_id,
        employee_id,
        title,
        description,
        category,
        target_date,
        status
    )
VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        'active'
    )
RETURNING
    id;