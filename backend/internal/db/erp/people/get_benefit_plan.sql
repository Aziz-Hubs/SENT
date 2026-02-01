-- name: GetBenefitPlan :one
SELECT * FROM benefit_plans WHERE id = $1 LIMIT 1;