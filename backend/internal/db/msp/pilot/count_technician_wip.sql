-- name: CountTechnicianWIP :one
SELECT COUNT(*)
FROM tickets
WHERE
    assignee_id = $1
    AND status IN (
        'new',
        'in_progress',
        'waiting'
    );