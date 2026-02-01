-- name: GetAgentByID :one
SELECT * FROM agents WHERE id = $1 LIMIT 1;