-- name: CreateAgent :one
INSERT INTO
    agents (
        tenant_id,
        hostname,
        os,
        arch,
        ip,
        mac,
        version,
        status
    )
VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8
    )
RETURNING
    *;