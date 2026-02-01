-- name: AddInterviewer :exec
INSERT INTO
    interviewers (interview_id, employee_id)
VALUES ($1, $2);