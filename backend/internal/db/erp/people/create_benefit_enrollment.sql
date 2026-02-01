-- name: CreateBenefitEnrollment :one
INSERT INTO
    benefit_enrollments (
        tenant_id,
        employee_id,
        benefit_plan_id,
        tier,
        employee_cost,
        employer_cost,
        effective_from,
        status
    )
VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        'active'
    )
RETURNING
    *;