-- name: CreateAuditLog :exec
INSERT INTO
    audit_logs (
        tenant_id,
        app_name,
        action,
        actor_id,
        payload,
        timestamp
    )
VALUES ($1, $2, $3, $4, $5, $6);