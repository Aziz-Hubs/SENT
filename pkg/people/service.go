package people

import (
	"context"
	"fmt"
	"time"

	"sent/ent"
	"sent/ent/employee"
	"sent/pkg/crypto"
	"sent/pkg/orchestrator"

	"github.com/riverqueue/river"
)

// PeopleService is the main HCM engine.
type PeopleService struct {
	db       *ent.Client
	payroll  *PayrollEngine
	contract *ContractService
	river    *river.Client[*ent.Tx]
}

// NewPeopleService initializes the PeopleService.
func NewPeopleService(db *ent.Client, payroll *PayrollEngine, contract *ContractService, river *river.Client[*ent.Tx]) *PeopleService {
	return &PeopleService{
		db:       db,
		payroll:  payroll,
		contract: contract,
		river:    river,
	}
}

// HireEmployee creates a new employee record in STAGED status.
func (s *PeopleService) HireEmployee(ctx context.Context, first, last, email, salary string) (*ent.Employee, error) {
	// Encrypt salary
	encryptedSalary, err := crypto.Encrypt(salary)
	if err != nil {
		return nil, fmt.Errorf("failed to encrypt salary: %w", err)
	}

	empID := fmt.Sprintf("SENT-%d", time.Now().Unix())

	emp, err := s.db.Employee.Create().
		SetFirstName(first).
		SetLastName(last).
		SetEmail(email).
		SetZitadelID("PENDING"). // Will be updated during activation
		SetEmployeeID(empID).
		SetSalaryEncrypted(encryptedSalary).
		SetStatus(employee.StatusSTAGED).
		Save(ctx)

	if err != nil {
		return nil, fmt.Errorf("failed to create employee: %w", err)
	}

	return emp, nil
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
	tx, err := s.db.Tx(ctx)
	if err != nil {
		return err
	}

	emp, err := tx.Employee.Get(ctx, empID)
	if err != nil {
		tx.Rollback()
		return err
	}

	// Mock Zitadel User Creation
	// In reality: zitadelClient.CreateUser(...)
	zitadelID := fmt.Sprintf("zitadel_%d", time.Now().Unix())

	// Update local status
	err = tx.Employee.UpdateOne(emp).
		SetStatus(employee.StatusACTIVE).
		SetZitadelID(zitadelID).
		SetSignatureHash(hash).
		SetSignedAt(timestamp).
		Exec(ctx)

	if err != nil {
		// If DB update fails, we should ideally rollback Zitadel (but this is a mock)
		tx.Rollback()
		return fmt.Errorf("failed to activate employee locally: %w", err)
	}

	return tx.Commit()
}

// TerminateEmployee deactivates the employee and locks their Zitadel account.
func (s *PeopleService) TerminateEmployee(ctx context.Context, tenantID int, empID int, actorID string) error {
	tx, err := s.db.Tx(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	emp, err := tx.Employee.Query().Where(employee.ID(empID)).WithManager().Only(ctx)
	if err != nil {
		return err
	}

	// 1. Update local status
	err = tx.Employee.UpdateOne(emp).
		SetStatus(employee.StatusTERMINATED).
		Exec(ctx)
	if err != nil {
		return err
	}

	// 2. Lock Zitadel Account (Mock)
	fmt.Printf("[ZITADEL] Locking user %s\n", emp.ZitadelID)

	// 3. Enqueue Termination Job Sequence
	// Find manager for call redirection
	var managerID *int
	if emp.Edges.Manager != nil {
		mid := emp.Edges.Manager.ID
		managerID = &mid
	}

	_, err = s.river.InsertTx(ctx, tx, orchestrator.TerminationArgs{
		TenantID:  tenantID,
		UserID:    empID,
		ActorID:   actorID,
		ManagerID: managerID,
	}, nil)

	if err != nil {
		return fmt.Errorf("failed to enqueue termination job: %w", err)
	}

	return tx.Commit()
}