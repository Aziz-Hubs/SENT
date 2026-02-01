-- name: CreateJob :one
INSERT INTO
    jobs (
        tenant_id,
        name,
        script_id,
        targets,
        cron_schedule,
        next_run
    )
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING
    *;