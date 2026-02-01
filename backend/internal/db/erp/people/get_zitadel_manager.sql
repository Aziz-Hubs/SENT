-- name: GetZitadelAndManagerID :one
SELECT zitadel_id, manager_id FROM employees WHERE id = $1;