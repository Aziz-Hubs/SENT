-- name: ListAgents :many
SELECT * FROM agents ORDER BY last_seen DESC;