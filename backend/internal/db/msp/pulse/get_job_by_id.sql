-- name: GetJobByID :one
SELECT * FROM jobs WHERE id = $1 LIMIT 1;