-- name: GetTicketPriority :one
SELECT priority FROM tickets WHERE id = $1;