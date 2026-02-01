-- name: GetTicketExecutionPlan :one
SELECT execution_plan FROM tickets WHERE id = $1;