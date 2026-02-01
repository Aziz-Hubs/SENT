-- name: ActivateEmployee :exec
UPDATE employees
SET
    status = 'active',
    zitadel_id = $1,
    signature_hash = $2,
    signed_at = $3,
    updated_at = NOW()
WHERE
    id = $4;