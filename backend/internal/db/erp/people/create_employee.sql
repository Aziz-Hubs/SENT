-- name: CreateEmployee :one
INSERT INTO
    employees (
        tenant_id,
        zitadel_id,
        employee_id,
        first_name,
        last_name,
        email,
        phone,
        status,
        salary_encrypted,
        bank_details_encrypted,
        hipo_status,
        department_id
    )
VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8,
        $9,
        $10,
        $11,
        $12
    )
RETURNING
    id;