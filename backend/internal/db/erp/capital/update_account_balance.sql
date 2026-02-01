-- name: UpdateAccountBalance :exec
UPDATE accounts
SET
    balance = balance + $1,
    updated_at = NOW()
WHERE
    id = $2;