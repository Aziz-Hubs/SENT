-- name: CreateUser :one
INSERT INTO
    users (
        tenant_id,
        zitadel_id,
        email,
        first_name,
        last_name,
        job_title,
        department,
        role,
        seniority,
        max_wip
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
        $10
    )
RETURNING
    id;