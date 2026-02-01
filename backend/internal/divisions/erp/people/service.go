package people

import (
	"context"
	"fmt"
	"time"

	peopledb "sent/internal/db/erp/people/sqlc"
	"sent/internal/platform/crypto"
	"sent/internal/platform/orchestrator"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/riverqueue/river"
)

// PeopleService is the main HCM engine.
type PeopleService struct {
	pool       *pgxpool.Pool
	queries    *peopledb.Queries
	payroll    *PayrollEngine
	contract   *ContractService
	recruiting *RecruitingService
	benefits   *BenefitsManager
	river      *river.Client[pgx.Tx]
}

// NewPeopleService initializes the PeopleService.
func NewPeopleService(pool *pgxpool.Pool, payroll *PayrollEngine, contract *ContractService, recruiting *RecruitingService, client *river.Client[pgx.Tx]) *PeopleService {
	return &PeopleService{
		pool:       pool,
		queries:    peopledb.New(pool),
		payroll:    payroll,
		contract:   contract,
		recruiting: recruiting,
		benefits:   NewBenefitsManager(pool),
		river:      client,
	}
}

// Employee represents an employee record.
type Employee struct {
	ID        int    `json:"id"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Email     string `json:"email"`
	Status    string `json:"status"`
}

// HireEmployee creates a new employee record in STAGED status.
func (s *PeopleService) HireEmployee(ctx context.Context, tenantID int32, first, last, email, salary string) (*Employee, error) {
	// Encrypt salary
	encryptedSalary, err := crypto.Encrypt(salary)
	if err != nil {
		return nil, fmt.Errorf("failed to encrypt salary: %w", err)
	}

	empIDStr := fmt.Sprintf("SENT-%d", time.Now().Unix())

	id, err := s.queries.CreateEmployee(ctx, peopledb.CreateEmployeeParams{
		TenantID:        tenantID,
		FirstName:       first,
		LastName:        last,
		Email:           email,
		ZitadelID:       "PENDING",
		EmployeeID:      empIDStr,
		SalaryEncrypted: encryptedSalary,
		Status:          pgtype.Text{String: "staged", Valid: true},
	})

	if err != nil {
		return nil, fmt.Errorf("failed to create employee: %w", err)
	}

	return &Employee{ID: int(id), FirstName: first, LastName: last, Email: email, Status: "staged"}, nil
}

// ActivateEmployee clears the digital signature gate and activates the user in Zitadel.
func (s *PeopleService) ActivateEmployee(ctx context.Context, empID int, signatureBase64 string, ip string) error {
	// 1. Verify and generate contract
	timestamp := time.Now()
	hash := s.contract.VerifySignature(signatureBase64, ip, timestamp)

	_, err := s.contract.GenerateEmploymentContract(ctx, empID, signatureBase64, map[string]string{
		"ip":   ip,
		"hash": hash,
	})
	if err != nil {
		return fmt.Errorf("contract generation failed: %w", err)
	}

	// 2. Start Atomic-like activation
	tx, err := s.pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	// Use tx with queries
	qtx := s.queries.WithTx(tx)

	// Mock Zitadel User Creation
	zitadelID := fmt.Sprintf("zitadel_%d", time.Now().Unix())

	// Update local status
	err = qtx.ActivateEmployee(ctx, peopledb.ActivateEmployeeParams{
		ZitadelID:     zitadelID,
		SignatureHash: pgtype.Text{String: hash, Valid: true},
		SignedAt:      pgtype.Timestamptz{Time: timestamp, Valid: true},
		ID:            int32(empID),
	})

	if err != nil {
		return fmt.Errorf("failed to activate employee locally: %w", err)
	}

	return tx.Commit(ctx)
}

// TerminateEmployee deactivates the employee and locks their Zitadel account.
func (s *PeopleService) TerminateEmployee(ctx context.Context, tenantID int, empID int, actorID string) error {
	tx, err := s.pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	qtx := s.queries.WithTx(tx)

	row, err := qtx.GetZitadelAndManagerID(ctx, int32(empID))
	if err != nil {
		return err
	}

	// 1. Update local status
	err = qtx.TerminateEmployee(ctx, int32(empID))
	if err != nil {
		return err
	}

	// 2. Lock Zitadel Account (Mock)
	fmt.Printf("[ZITADEL] Locking user %s\n", row.ZitadelID)

	// 3. Enqueue Termination Job Sequence
	var managerIDPtr *int
	if row.ManagerID.Valid {
		mID := int(row.ManagerID.Int32)
		managerIDPtr = &mID
	}

	_, err = s.river.InsertTx(ctx, tx, orchestrator.TerminationArgs{
		TenantID:  tenantID,
		UserID:    empID,
		ActorID:   actorID,
		ManagerID: managerIDPtr,
	}, nil)

	if err != nil {
		return fmt.Errorf("failed to enqueue termination job: %w", err)
	}

	return tx.Commit(ctx)
}
