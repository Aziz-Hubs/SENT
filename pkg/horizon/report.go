package horizon

import (
	"context"
	"fmt"
	"sent/ent"
	"sent/pkg/vault"

	"github.com/johnfercher/maroto/v2"
	"github.com/johnfercher/maroto/v2/pkg/components/row"
	"github.com/johnfercher/maroto/v2/pkg/components/text"
	"github.com/johnfercher/maroto/v2/pkg/config"
	"github.com/johnfercher/maroto/v2/pkg/consts/align"
	"github.com/johnfercher/maroto/v2/pkg/consts/fontstyle"
	"github.com/johnfercher/maroto/v2/pkg/props"
	"encoding/base64"
	"time"
)

// ReportGenerator creates pixel-perfect vCIO reports.
type ReportGenerator struct {
	db    *ent.Client
	vault *vault.VaultBridge
}

// NewReportGenerator initializes the reporter.
func NewReportGenerator(db *ent.Client, vault *vault.VaultBridge) *ReportGenerator {
	return &ReportGenerator{db: db, vault: vault}
}

// GenerateQBR generates a PDF report for a tenant.
func (g *ReportGenerator) GenerateQBR(ctx context.Context, tenantID int, commentary string) (string, error) {
	t, _ := g.db.Tenant.Get(ctx, tenantID)
	snapshot, _ := g.db.HealthScoreSnapshot.Query().First(ctx) // Get latest

	cfg := config.NewBuilder().Build()
	m := maroto.New(cfg)

	// Cover Page
	m.AddRows(row.New(40).Add(
		text.NewCol(12, "QUARTERLY BUSINESS REVIEW", props.Text{
			Size:  24,
			Style: fontstyle.Bold,
			Align: align.Center,
		}),
	))

	m.AddRows(row.New(10).Add(
		text.NewCol(12, fmt.Sprintf("Prepared for: %s", t.Name), props.Text{
			Size:  14,
			Align: align.Center,
		}),
	))

	// Health Score Section
	m.AddRows(row.New(20).Add(
		text.NewCol(12, "Infrastructure Health Executive Summary", props.Text{
			Size:  16,
			Style: fontstyle.Bold,
		}),
	))

	if snapshot != nil {
		m.AddRows(row.New(10).Add(
			text.NewCol(6, fmt.Sprintf("Overall Health Score: %.1f/100", snapshot.OverallScore), props.Text{Style: fontstyle.Bold}),
			text.NewCol(6, fmt.Sprintf("Performance: %.1f", snapshot.PerformanceScore), props.Text{}),
		))
		m.AddRows(row.New(10).Add(
			text.NewCol(6, fmt.Sprintf("Security & Compliance: %.1f", snapshot.SecurityScore), props.Text{}),
			text.NewCol(6, fmt.Sprintf("Lifecycle: %.1f", snapshot.LifecycleScore), props.Text{}),
		))
	}

	// Commentary Section
	m.AddRows(row.New(20).Add(
		text.NewCol(12, "Strategic vCIO Commentary", props.Text{Size: 14, Style: fontstyle.Bold}),
	))
	m.AddRows(row.New(40).Add(
		text.NewCol(12, commentary, props.Text{Size: 10}),
	))

	// Footer
	m.AddRows(row.New(10).Add(
		text.NewCol(12, fmt.Sprintf("Generated on %s | SENT Horizon Engine", time.Now().Format("Jan 02, 2006")), props.Text{
			Size:  8,
			Align: align.Center,
			Color: &props.Color{Red: 128, Green: 128, Blue: 128},
		}),
	))

	document, err := m.Generate()
	if err != nil {
		return "", err
	}

	// Save to Vault
	fileName := fmt.Sprintf("reports/QBR_%s_%d.pdf", t.Name, time.Now().Unix())
	pdfBase64 := base64.StdEncoding.EncodeToString(document.GetBytes())
	
	if err := g.vault.SaveFile(fileName, pdfBase64, tenantID); err != nil {
		return "", err
	}

	return fileName, nil
}
