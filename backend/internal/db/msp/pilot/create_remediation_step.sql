-- name: CreateRemediationStep :one
INSERT INTO
    remediation_steps (
        tenant_id,
        ticket_id,
        action_name,
        sequence,
        status
    )
VALUES ($1, $2, $3, $4, 'pending')
RETURNING
    id;