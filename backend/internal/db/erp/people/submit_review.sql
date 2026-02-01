-- name: SubmitReview :exec
UPDATE performance_reviews
SET
    overall_rating = $1,
    strengths = $2,
    areas_for_improvement = $3,
    manager_comments = $4,
    status = 'submitted',
    submitted_at = $5,
    updated_at = NOW()
WHERE
    id = $6;