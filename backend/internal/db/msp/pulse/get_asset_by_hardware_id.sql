-- name: GetAssetByHardwareID :one
SELECT a.id, a.name, u.email
FROM assets a
    LEFT JOIN users u ON a.owner_id = u.id
WHERE
    a.hardware_id = $1;