-- name: UpdateApplicationStatus :exec
UPDATE applications
SET
    status = $2,
    updated_at = NOW()
WHERE
    id = $1;