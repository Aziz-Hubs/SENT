-- name: CreateWorkLog :exec
INSERT INTO
    work_logs (
        tenant_id,
        ticket_id,
        technician_id,
        duration_hours,
        note,
        is_billable,
        status
    )
VALUES ($1, $2, $3, $4, $5, $6, $7);