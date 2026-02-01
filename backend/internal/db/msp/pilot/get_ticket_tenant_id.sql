-- name: GetTicketTenantID :one
SELECT tenant_id FROM tickets WHERE id = $1;