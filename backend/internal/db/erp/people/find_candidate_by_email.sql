-- name: FindCandidateByEmail :one
SELECT id FROM candidates WHERE email = $1 AND tenant_id = $2;