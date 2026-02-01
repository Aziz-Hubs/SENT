-- name: UpdateTimeOffStatus :exec
UPDATE time_off_requests
SET
    status = $2,
    approved_by_id = $3,
    updated_at = NOW()
WHERE
    id = $1;