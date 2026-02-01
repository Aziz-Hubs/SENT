-- name: ListActiveBenefitPlans :many
SELECT *
FROM benefit_plans
WHERE
    tenant_id = $1
    AND status = 'active';