-- name: UpdateJobNextRun :exec
UPDATE jobs SET next_run = $2, updated_at = NOW() WHERE id = $1;