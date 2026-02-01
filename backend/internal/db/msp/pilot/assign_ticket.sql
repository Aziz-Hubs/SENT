-- name: AssignTicket :exec
UPDATE tickets
SET
    assignee_id = $1,
    status = 'in_progress',
    updated_at = NOW()
WHERE
    id = $2;