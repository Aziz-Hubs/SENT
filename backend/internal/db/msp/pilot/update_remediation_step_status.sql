-- name: UpdateRemediationStepStatus :exec
UPDATE remediation_steps
SET
    status = $2,
    updated_at = NOW()
WHERE
    id = $1;