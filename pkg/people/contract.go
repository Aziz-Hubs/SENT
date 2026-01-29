package people

import (
	"context"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"fmt"
	"time"

	"sent/ent"
	"sent/ent/employee"
	"sent/pkg/vault"

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
	db    *ent.Client
	vault *vault.VaultBridge
}

// NewContractService initializes a new ContractService.
func NewContractService(db *ent.Client, vault *vault.VaultBridge) *ContractService {
	return &ContractService{
		db:    db,
		vault: vault,
	}
}

// GenerateEmploymentContract creates a PDF contract for an employee.
func (s *ContractService) GenerateEmploymentContract(ctx context.Context, empID int, signatureBase64 string, metadata map[string]string) (string, error) {
	emp, err := s.db.Employee.Query().
		Where(employee.ID(empID)).
		WithTenant().
		Only(ctx)
	if err != nil {
		return "", fmt.Errorf("employee not found: %w", err)
	}

	tenantID := 1
	if emp.Edges.Tenant != nil {
		tenantID = emp.Edges.Tenant.ID
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

	document, err := m.Generate()
	if err != nil {
		return "", fmt.Errorf("failed to generate PDF: %w", err)
	}

	// Save to Vault
	fileName := fmt.Sprintf("contracts/contract_%s_%d.pdf", emp.EmployeeID, time.Now().Unix())
	pdfBase64 := base64.StdEncoding.EncodeToString(document.GetBytes())
	
	if err := s.vault.SaveFile(fileName, pdfBase64, tenantID); err != nil {
		return "", fmt.Errorf("failed to save contract to vault: %w", err)
	}

	return fileName, nil
}

// VerifySignature calculates a hash for signature metadata.
func (s *ContractService) VerifySignature(signatureBase64 string, ip string, timestamp time.Time) string {
	data := fmt.Sprintf("%s|%s|%d", signatureBase64, ip, timestamp.Unix())
	hash := sha256.Sum256([]byte(data))
	return hex.EncodeToString(hash[:])
}
