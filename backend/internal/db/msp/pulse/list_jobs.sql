-- name: ListJobs :many
SELECT j.*, s.name as script_name
FROM jobs j
    JOIN scripts s ON j.script_id = s.id
ORDER BY j.created_at DESC;