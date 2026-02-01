-- name: UpdateTimeEntryStatus :exec
UPDATE time_entries
SET
    status = $2,
    updated_at = NOW()
WHERE
    id = $1;