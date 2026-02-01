-- name: UpdateGoalProgress :exec
UPDATE goals
SET
    progress = $2,
    status = $3,
    completed_at = $4,
    updated_at = NOW()
WHERE
    id = $1;