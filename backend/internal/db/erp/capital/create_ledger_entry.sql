-- name: CreateLedgerEntry :exec
INSERT INTO
    ledger_entries (
        tenant_id,
        transaction_id,
        account_id,
        amount,
        direction
    )
VALUES ($1, $2, $3, $4, $5);