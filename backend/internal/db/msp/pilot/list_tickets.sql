-- name: ListTickets :many
SELECT
    t.id,
    t.subject,
    t.description,
    t.status,
    t.priority,
    t.created_at,
    t.deep_link,
    t.execution_plan,
    u1.email as requester_email,
    u2.email as assignee_email,
    a.name as asset_name
FROM
    tickets t
    LEFT JOIN users u1 ON t.requester_id = u1.id
    LEFT JOIN users u2 ON t.assignee_id = u2.id
    LEFT JOIN assets a ON t.asset_id = a.id
WHERE
    t.tenant_id = $1
ORDER BY
    CASE t.priority
        WHEN 'P1' THEN 1
        WHEN 'P2' THEN 2
        WHEN 'P3' THEN 3
        ELSE 4
    END;