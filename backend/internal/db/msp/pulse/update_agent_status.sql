-- name: UpdateAgentStatus :exec
UPDATE agents
SET
    status = $2,
    last_seen = NOW(),
    updated_at = NOW()
WHERE
    id = $1;