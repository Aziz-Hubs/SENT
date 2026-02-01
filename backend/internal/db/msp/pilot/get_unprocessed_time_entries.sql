-- name: GetUnprocessedTimeEntries :many
SELECT *
FROM time_entries
WHERE
    tenant_id = $1
    AND status = 'pending';