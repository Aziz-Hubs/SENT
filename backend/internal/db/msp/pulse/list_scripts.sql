-- name: ListScripts :many
SELECT id, name, description, content, type
FROM scripts
WHERE
    tenant_id = $1;