-- name: CreateTicket :one
INSERT INTO
    tickets (
        tenant_id,
        subject,
        description,
        status,
        priority,
        requester_id,
        deep_link,
        execution_plan
    )
VALUES (
        $1,
        $2,
        $3,
        'new',
        'P2',
        $4,
        $5,
        $6
    )
RETURNING
    id;
-- Note: Modified to include subject (matches code as 'subject', schema has 'title').
-- I will fix schema to say 'subject' to match code.