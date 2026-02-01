package people

import (
	"context"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/johnfercher/maroto/v2"
	"github.com/johnfercher/maroto/v2/pkg/components/code"
	"github.com/johnfercher/maroto/v2/pkg/components/image"
	"github.com/johnfercher/maroto/v2/pkg/components/row"
	"github.com/johnfercher/maroto/v2/pkg/components/text"
	"github.com/johnfercher/maroto/v2/pkg/config"
	"github.com/johnfercher/maroto/v2/pkg/consts/align"
	"github.com/johnfercher/maroto/v2/pkg/consts/extension"
	"github.com/johnfercher/maroto/v2/pkg/consts/fontstyle"
	"github.com/johnfercher/maroto/v2/pkg/props"
)

// ContractService handles employment contract generation and signing.
type ContractService struct {
	pool *pgxpool.Pool
}

// NewContractService initializes a new ContractService.
func NewContractService(pool *pgxpool.Pool) *ContractService {
	return &ContractService{
		pool: pool,
	}
}

// GenerateEmploymentContract creates a PDF contract for an employee.
func (s *ContractService) GenerateEmploymentContract(ctx context.Context, empID int, signatureBase64 string, metadata map[string]string) (string, error) {
	var emp struct {
		FirstName  string
		LastName   string
		EmployeeID string
		TenantID   int
	}

	err := s.pool.QueryRow(ctx, `
		SELECT first_name, last_name, employee_id, tenant_id 
		FROM employees 
		WHERE id = $1`, empID).Scan(&emp.FirstName, &emp.LastName, &emp.EmployeeID, &emp.TenantID)

	if err != nil {
		return "", fmt.Errorf("employee not found: %w", err)
	}

	cfg := config.NewBuilder().Build()
	m := maroto.New(cfg)

	// Header
	m.AddRows(row.New(20).Add(
		text.NewCol(12, "EMPLOYMENT AGREEMENT", props.Text{
			Size:  16,
			Style: fontstyle.Bold,
			Align: align.Center,
		}),
	))

	// Employee Info
	m.AddRows(row.New(10).Add(
		text.NewCol(12, fmt.Sprintf("Employee Name: %s %s", emp.FirstName, emp.LastName), props.Text{Size: 12}),
	))
	m.AddRows(row.New(10).Add(
		text.NewCol(12, fmt.Sprintf("Employee ID: %s", emp.EmployeeID), props.Text{Size: 12}),
	))

	// Body (Placeholder text)
	m.AddRows(row.New(40).Add(
		text.NewCol(12, "This agreement is made between SENT LLC and the employee. The employee agrees to perform the duties assigned and adhere to company policies. Compensation details are as per the active compensation agreement.", props.Text{Size: 10}),
	))

	// Signature Section
	if signatureBase64 != "" {
		sigBytes, err := base64.StdEncoding.DecodeString(signatureBase64)
		if err == nil {
			m.AddRows(row.New(30).Add(
				image.NewFromBytesCol(6, sigBytes, extension.Png, props.Rect{
					Center:  true,
					Percent: 80,
				}),
				text.NewCol(6, fmt.Sprintf("Signed at: %s\nIP: %s\nHash: %s",
					time.Now().Format(time.RFC3339),
					metadata["ip"],
					metadata["hash"]), props.Text{Size: 8}),
			))
		}
	}

	// QR Code for Verification
	m.AddRows(row.New(40).Add(
		code.NewQrCol(4, fmt.Sprintf("VERIFY: %s", emp.EmployeeID), props.Rect{
			Center:  true,
			Percent: 80,
		}),
	))

	_, err = m.Generate()
	if err != nil {
		return "", fmt.Errorf("failed to generate PDF: %w", err)
	}

	// TODO: Save to a central file storage instead of Vault
	return "contract_generated_but_vault_removed", nil
}

// VerifySignature calculates a hash for signature metadata.
func (s *ContractService) VerifySignature(signatureBase64 string, ip string, timestamp time.Time) string {
	data := fmt.Sprintf("%s|%s|%d", signatureBase64, ip, timestamp.Unix())
	hash := sha256.Sum256([]byte(data))
	return hex.EncodeToString(hash[:])
}
