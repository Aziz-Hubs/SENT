-- name: UpdateContractHours :exec
UPDATE contracts
SET
    remaining_hours = remaining_hours - $2,
    updated_at = NOW()
WHERE
    id = $1;