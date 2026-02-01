-- name: CreateBenefitPlan :one
INSERT INTO
    benefit_plans (
        tenant_id,
        name,
        description,
        type,
        employer_contribution,
        employee_deduction,
        status
    )
VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        'active'
    )
RETURNING
    *;