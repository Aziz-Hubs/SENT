-- name: TerminateEmployee :exec
UPDATE employees
SET
    status = 'terminated',
    updated_at = NOW()
WHERE
    id = $1;