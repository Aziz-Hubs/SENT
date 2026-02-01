-- name: CheckEmployeeOnLeave :one
SELECT EXISTS (
        SELECT 1
        FROM time_off_requests
        WHERE
            employee_id = $1
            AND status = 'APPROVED'
            AND start_date <= $2
            AND end_date >= $2
    );