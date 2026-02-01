-- name: ListProducts :many
SELECT * FROM products WHERE tenant_id = $1 ORDER BY name ASC;