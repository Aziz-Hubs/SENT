-- name: GetTimeEntryWithTicket :one
SELECT te.id, te.hours as duration_hours, te.tenant_id, te.status
FROM time_entries te
WHERE
    te.id = $1;
-- Note: Simplified join for now, if work_type is needed it should be on ticket or entry.
-- Original code joined tickets t ON te.ticket_id = t.id