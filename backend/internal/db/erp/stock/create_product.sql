-- name: CreateProduct :one
INSERT INTO
    products (
        tenant_id,
        sku,
        name,
        description,
        unit_cost,
        quantity
    )
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING
    id;