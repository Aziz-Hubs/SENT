-- name: GetScriptByID :one
SELECT * FROM scripts WHERE id = $1 LIMIT 1;