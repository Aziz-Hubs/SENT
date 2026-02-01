-- name: RequestTimeOff :one
INSERT INTO
    time_off_requests (
        tenant_id,
        employee_id,
        type,
        start_date,
        end_date,
        requested_hours,
        notes,
        status,
        created_at,
        updated_at
    )
VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        'PENDING',
        NOW(),
        NOW()
    )
RETURNING
    id;
-- Note: schema has 'type', code used 'request_type'. I'll stick to 'type' from schema.