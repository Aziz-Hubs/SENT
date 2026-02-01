-- name: UpdateRemediationStepOutput :exec
UPDATE remediation_steps
SET
    status = $2,
    output = $3,
    updated_at = NOW()
WHERE
    id = $1;