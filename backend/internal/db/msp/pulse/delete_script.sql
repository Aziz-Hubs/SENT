-- name: DeleteScript :exec
DELETE FROM scripts WHERE id = $1;