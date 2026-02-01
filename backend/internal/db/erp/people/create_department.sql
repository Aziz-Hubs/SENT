-- name: CreateDepartment :one
INSERT INTO
    departments (
        tenant_id,
        name,
        code,
        description
    )
VALUES ($1, $2, $3, $4)
RETURNING
    id;