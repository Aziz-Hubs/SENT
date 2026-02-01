-- name: GetUserSeniority :one
SELECT seniority FROM users WHERE id = $1;