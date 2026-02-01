-- name: GetContractByID :one
SELECT * FROM contracts WHERE id = $1 LIMIT 1;