-- name: GetAccountByNumber :one
SELECT id, balance
FROM accounts
WHERE
    number = $1
    AND tenant_id = $2;