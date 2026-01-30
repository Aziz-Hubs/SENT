package capital

import (
	"bytes"
	"context"
	"encoding/base64"
	"encoding/csv"
	"fmt"
	"time"

	"sent/ent"
	"sent/ent/account"
	"sent/ent/journalentry"
	"sent/ent/ledgerentry"
	"sent/ent/tenant"
	"sent/ent/transaction"
	"sent/ent/user"
	"sent/pkg/auth"
	"github.com/shopspring/decimal"
	"github.com/jung-kurt/gofpdf/v2"
)

// CapitalBridge serves as the interface for financial operations.
// It handles accounts, transactions, and reporting.
type CapitalBridge struct {
	ctx  context.Context
	db   *ent.Client
	auth *auth.AuthBridge
}

// AccountDTO represents a financial account.
type AccountDTO struct {
	ID      int     `json:"id"`
	Name    string  `json:"name"`
	Number  string  `json:"number"`
	Type    string  `json:"type"`
	Balance float64 `json:"balance"`
}

// EntryRequest represents a single ledger line item (debit or credit).
type EntryRequest struct {
	AccountID int     `json:"account_id"`
	Amount    float64 `json:"amount"`
	Direction string  `json:"direction"` // "debit" or "credit"
}

// TransactionRequest represents a complete multi-entry journal transaction.
type TransactionRequest struct {
	Description string         `json:"description"`
	Date        time.Time      `json:"date"`
	Entries     []EntryRequest `json:"entries"`
	UserID      int            `json:"user_id"`
}

// NewCapitalBridge initializes a new CapitalBridge.
func NewCapitalBridge(db *ent.Client, auth *auth.AuthBridge) *CapitalBridge {
	return &CapitalBridge{db: db, auth: auth}
}

// Startup initializes the bridge context.
func (c *CapitalBridge) Startup(ctx context.Context) {
	c.ctx = ctx
}

// GetAccounts retrieves all financial accounts.
func (c *CapitalBridge) GetAccounts() ([]AccountDTO, error) {
	profile, err := c.auth.GetUserProfile()
	if err != nil {
		return nil, err
	}
	tenantID := profile.TenantID

	accounts, err := c.db.Account.Query().
		Where(account.HasTenantWith(tenant.ID(tenantID))).
		All(c.ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to query accounts: %w", err)
	}

	if len(accounts) == 0 {
		// Fetch tenant
		tnt, err := c.db.Tenant.Get(c.ctx, tenantID)
		if err != nil {
			return nil, fmt.Errorf("failed to get tenant for seeding: %w", err)
		}

		if err := c.seedDefaultAccounts(tnt); err != nil {
			return nil, err
		}
		// Re-query after seeding with tenant filter
		accounts, err = c.db.Account.Query().
			Where(account.HasTenantWith(tenant.ID(tenantID))).
			All(c.ctx)
		if err != nil {
			return nil, err
		}
	}

	dtos := make([]AccountDTO, len(accounts))
	for i, a := range accounts {
		bal, _ := a.Balance.Float64()
		dtos[i] = AccountDTO{
			ID:      a.ID,
			Name:    a.Name,
			Number:  a.Number,
			Type:    string(a.Type),
			Balance: bal,
		}
	}
	return dtos, nil
}

// seedDefaultAccounts creates a basic chart of accounts for a new system.
func (c *CapitalBridge) seedDefaultAccounts(t *ent.Tenant) error {
	// Check existence
	exists, _ := c.db.Account.Query().Where(account.HasTenantWith(tenant.ID(t.ID))).Exist(c.ctx)
	if exists {
		return nil
	}

	// Create default accounts
	bulk := []*ent.AccountCreate{
		c.db.Account.Create().SetName("Operating Cash").SetNumber("1000").SetType(account.TypeAsset).SetTenant(t).SetBalance(decimal.NewFromInt(10000)),
		c.db.Account.Create().SetName("Revenue").SetNumber("4000").SetType(account.TypeRevenue).SetTenant(t),
		c.db.Account.Create().SetName("Rent Expense").SetNumber("5000").SetType(account.TypeExpense).SetTenant(t),
	}
	
	if _, err := c.db.Account.CreateBulk(bulk...).Save(c.ctx); err != nil {
		return fmt.Errorf("failed to seed accounts: %w", err)
	}
	return nil
}

// TransactionDTO represents a summary of a recorded transaction.
type TransactionDTO struct {
	ID             int       `json:"id"`
	Description    string    `json:"description"`
	Date           time.Time `json:"date"`
	TotalAmount    float64   `json:"total_amount"`
	ApprovalStatus string    `json:"approval_status"`
	Reference      string    `json:"reference"`
}

// GetTransactions retrieves all transactions for the current tenant.
func (c *CapitalBridge) GetTransactions() ([]TransactionDTO, error) {
	profile, err := c.auth.GetUserProfile()
	if err != nil {
		return nil, err
	}
	tenantID := profile.TenantID

	txs, err := c.db.Transaction.Query().
		Where(transaction.HasTenantWith(tenant.ID(tenantID))).
		Order(ent.Desc(transaction.FieldDate)).
		All(c.ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to query transactions: %w", err)
	}

	dtos := make([]TransactionDTO, len(txs))
	for i, t := range txs {
		total, _ := t.TotalAmount.Float64()
		dtos[i] = TransactionDTO{
			ID:             t.ID,
			Description:    t.Description,
			Date:           t.Date,
			TotalAmount:    total,
			ApprovalStatus: string(t.ApprovalStatus),
			Reference:      t.Reference,
		}
	}
	return dtos, nil
}

// ApproveTransaction moves a STAGED transaction to APPROVED and updates account balances.
func (c *CapitalBridge) ApproveTransaction(transactionID int) (string, error) {
	// RBAC: Check for admin role or expert seniority
	prof, err := c.auth.GetUserProfile()
	if err != nil {
		return "", fmt.Errorf("authentication required: %w", err)
	}
	
	if prof.Role != "admin" && prof.Seniority != "expert" {
		return "", fmt.Errorf("insufficient seniority: transaction approval requires 'expert' status")
	}

	tx, err := c.db.Tx(c.ctx)
	if err != nil {
		return "", err
	}

	txn, err := tx.Transaction.Query().
		Where(
			transaction.ID(transactionID),
			transaction.HasTenantWith(tenant.ID(prof.TenantID)),
		).
		WithLedgerEntries(func(q *ent.LedgerEntryQuery) {
			q.WithAccount()
		}).
		Only(c.ctx)
	if err != nil {
		tx.Rollback()
		return "", fmt.Errorf("transaction not found or access denied: %w", err)
	}

	if txn.ApprovalStatus != transaction.ApprovalStatusSTAGED {
		tx.Rollback()
		return "", fmt.Errorf("transaction is not in a stageable status (STAGED)")
	}

	// 1. Update status
	err = tx.Transaction.UpdateOne(txn).
		SetApprovalStatus(transaction.ApprovalStatusAPPROVED).
		Exec(c.ctx)
	if err != nil {
		tx.Rollback()
		return "", err
	}

	// Also update JournalEntries status
	_, err = tx.JournalEntry.Update().
		Where(journalentry.HasTransactionWith(transaction.ID(txn.ID))).
		SetApprovalStatus(journalentry.ApprovalStatusAPPROVED).
		Save(c.ctx)
	if err != nil {
		tx.Rollback()
		return "", err
	}

	// 2. Update balances now that it's approved
	for _, e := range txn.Edges.LedgerEntries {
		acc := e.Edges.Account
		if acc == nil {
			tx.Rollback()
			return "", fmt.Errorf("ledger entry %d missing account edge", e.ID)
		}

		var newBalance decimal.Decimal
		if e.Direction == ledgerentry.DirectionDebit {
			newBalance = acc.Balance.Add(e.Amount)
		} else {
			newBalance = acc.Balance.Sub(e.Amount)
		}

		err = tx.Account.UpdateOne(acc).SetBalance(newBalance).Exec(c.ctx)
		if err != nil {
			tx.Rollback()
			return "", fmt.Errorf("failed to update account balance: %w", err)
		}
	}

	if err := tx.Commit(); err != nil {
		return "", err
	}

	return fmt.Sprintf("Transaction %d approved and balances updated.", transactionID), nil
}

// CreateTransaction records a new financial transaction with multiple ledger entries.
// It enforces Double-Entry Accounting rules (Debits must equal Credits).
func (c *CapitalBridge) CreateTransaction(req TransactionRequest) (string, error) {
	if err := validateBalance(req.Entries); err != nil {
		return "", err
	}

	tx, err := c.db.Tx(c.ctx)
	if err != nil {
		return "", fmt.Errorf("failed to start transaction: %w", err)
	}
	
	// Recovery safety
	defer func() {
		if v := recover(); v != nil {
			tx.Rollback()
			panic(v)
		}
	}()

	prof, err := c.auth.GetUserProfile()
	if err != nil {
		return "", err
	}
	tenantID := prof.TenantID

	tnt, err := tx.Tenant.Get(c.ctx, tenantID)
	if err != nil {
		tx.Rollback()
		return "", fmt.Errorf("tenant session invalid: %w", err)
	}

	usr, err := tx.User.Query().
		Where(
			user.ID(req.UserID), // For auditing, but we check role from prof too
			user.HasTenantWith(tenant.ID(tenantID)),
		).Only(c.ctx)
	
	if err != nil {
		tx.Rollback()
		return "", fmt.Errorf("unauthorized user context: %w", err)
	}

	// Calculate total amount for limit validation (sum of debits)
	totalAmount := decimal.Zero
	for _, e := range req.Entries {
		if e.Direction == "debit" {
			totalAmount = totalAmount.Add(decimal.NewFromFloat(e.Amount))
		}
	}

	approvalStatus := "APPROVED"
	// Financial Fraud Prevention: Intercept if amount exceeds tenant limit
	if totalAmount.GreaterThan(tnt.TransactionLimit) {
		// Only "Finance Manager" or "admin" can bypass the limit
		if usr.Role != "Finance Manager" && usr.Role != "admin" {
			approvalStatus = "STAGED"
			// Notify SENTchat manager channel (Simulation)
			fmt.Printf("[SENTchat] ALERT: Transaction '%s' ($%s) created by %s (%s) exceeds limit ($%s). Staging for manager approval.\n", 
				req.Description, totalAmount, usr.Email, usr.Role, tnt.TransactionLimit)
		}
	}

	// 1. Create Header
	txn, err := tx.Transaction.Create().
		SetDescription(req.Description).
		SetDate(req.Date).
		SetTenant(tnt).
		SetTotalAmount(totalAmount).
		SetApprovalStatus(transaction.ApprovalStatus(approvalStatus)).
		Save(c.ctx)
	if err != nil {
		tx.Rollback()
		return "", fmt.Errorf("failed to save transaction header: %w", err)
	}

		// 2. Create Entries and Update Balances
	for _, e := range req.Entries {
		decimalAmount := decimal.NewFromFloat(e.Amount)
		// Create JournalEntry (The specific entity for auditing)
		_, err := tx.JournalEntry.Create().
			SetAmount(decimalAmount).
			SetDirection(journalentry.Direction(e.Direction)).
			SetAccountID(e.AccountID).
			SetTransaction(txn).
			SetTenant(tnt).
			SetDescription(req.Description).
			SetApprovalStatus(journalentry.ApprovalStatus(approvalStatus)).
			Save(c.ctx)
		if err != nil {
			tx.Rollback()
			return "", fmt.Errorf("failed to save journal entry: %w", err)
		}

		// Also create LedgerEntry for legacy/backward compatibility if needed, 
		// but JournalEntry is the new source of truth for approvals.
		_, err = tx.LedgerEntry.Create().
			SetAmount(decimalAmount).
			SetDirection(ledgerentry.Direction(e.Direction)).
			SetAccountID(e.AccountID).
			SetTransaction(txn).
			SetTenant(tnt).
			Save(c.ctx)
		if err != nil {
			tx.Rollback()
			return "", fmt.Errorf("failed to save ledger entry: %w", err)
		}

		// Only update balances if APPROVED
		if approvalStatus == "APPROVED" {
			// Update Account Balance (Denormalization)
			acc, err := tx.Account.Get(c.ctx, e.AccountID)
			if err != nil {
				tx.Rollback()
				return "", err
			}

			var newBalance decimal.Decimal
			if e.Direction == "debit" {
				newBalance = acc.Balance.Add(decimalAmount)
			} else {
				newBalance = acc.Balance.Sub(decimalAmount)
			}

			err = tx.Account.UpdateOne(acc).SetBalance(newBalance).Exec(c.ctx)
			if err != nil {
				tx.Rollback()
				return "", fmt.Errorf("failed to update account balance: %w", err)
			}
		}
	}

	if err := tx.Commit(); err != nil {
		return "", fmt.Errorf("failed to commit transaction: %w", err)
	}

	if approvalStatus == "STAGED" {
		return fmt.Sprintf("Transaction '%s' exceeds limit and is STAGED for approval.", req.Description), nil
	}
	return fmt.Sprintf("Transaction '%s' posted.", req.Description), nil
}

func validateBalance(entries []EntryRequest) error {
	totalDebit := decimal.Zero
	totalCredit := decimal.Zero

	for _, entry := range entries {
		amt := decimal.NewFromFloat(entry.Amount)
		if entry.Direction == "debit" {
			totalDebit = totalDebit.Add(amt)
		} else {
			totalCredit = totalCredit.Add(amt)
		}
	}

	if !totalDebit.Equal(totalCredit) {
		return fmt.Errorf("transaction out of balance: Debits (%s) != Credits (%s)", totalDebit, totalCredit)
	}
	return nil
}

// ImportCSV parses a base64 encoded CSV string and logs the count of valid records.
// TODO: Implement actual import logic.
func (c *CapitalBridge) ImportCSV(base64Content string) (string, error) {
	data, err := base64.StdEncoding.DecodeString(base64Content)
	if err != nil {
		return "", fmt.Errorf("invalid base64 content: %w", err)
	}

	reader := csv.NewReader(bytes.NewReader(data))
	records, err := reader.ReadAll()
	if err != nil {
		return "", fmt.Errorf("csv parsing failed: %w", err)
	}

	count := 0
	for i, record := range records {
		// Skip header and empty rows
		if i == 0 || len(record) < 3 {
			continue
		}
		count++
	}

	return fmt.Sprintf("CSV Processed. Found %d valid transactions.", count), nil
}

// ExportTrialBalance generates a PDF of the current trial balance.
func (c *CapitalBridge) ExportTrialBalance() (string, error) {
	accounts, err := c.db.Account.Query().All(c.ctx)
	if err != nil {
		return "", err
	}

	pdf := gofpdf.New("P", "mm", "A4", "")
	pdf.AddPage()
	pdf.SetFont("Arial", "B", 16)
	pdf.Cell(40, 10, "SENTcapital - Trial Balance")
	pdf.Ln(12)
	
	// Table Header
	pdf.SetFont("Arial", "B", 12)
	pdf.CellFormat(30, 10, "Number", "1", 0, "C", false, 0, "")
	pdf.CellFormat(100, 10, "Account Name", "1", 0, "C", false, 0, "")
	pdf.CellFormat(40, 10, "Balance", "1", 0, "C", false, 0, "")
	pdf.Ln(10)
	
	// Table Body
	pdf.SetFont("Arial", "", 10)
	for _, a := range accounts {
		pdf.CellFormat(30, 10, a.Number, "1", 0, "L", false, 0, "")
		pdf.CellFormat(100, 10, a.Name, "1", 0, "L", false, 0, "")
		pdf.CellFormat(40, 10, a.Balance.StringFixed(2), "1", 0, "R", false, 0, "")
		pdf.Ln(10)
	}

	var buf bytes.Buffer
	if err := pdf.Output(&buf); err != nil {
		return "", err
	}
	return base64.StdEncoding.EncodeToString(buf.Bytes()), nil
}

// ExportProfitLoss generates a P&L Statement PDF.
func (c *CapitalBridge) ExportProfitLoss() (string, error) {
	accounts, err := c.db.Account.Query().All(c.ctx)
	if err != nil {
		return "", err
	}

	// Calculate totals
	var revenues, expenses []*ent.Account
	totalRev := decimal.Zero
	totalExp := decimal.Zero

	for _, a := range accounts {
		if a.Type == account.TypeRevenue {
			revenues = append(revenues, a)
			totalRev = totalRev.Add(a.Balance)
		} else if a.Type == account.TypeExpense {
			expenses = append(expenses, a)
			totalExp = totalExp.Add(a.Balance)
		}
	}

	// Generate PDF
	pdf := gofpdf.New("P", "mm", "A4", "")
	pdf.AddPage()
	pdf.SetFont("Arial", "B", 16)
	pdf.Cell(40, 10, "Profit & Loss Statement")
	pdf.Ln(15)

	// Revenue Section
	c.renderPdfSection(pdf, "REVENUE", revenues)
	c.renderPdfTotal(pdf, "Total Revenue", totalRev)
	pdf.Ln(15)

	// Expense Section
	c.renderPdfSection(pdf, "EXPENSES", expenses)
	c.renderPdfTotal(pdf, "Total Expenses", totalExp)
	pdf.Ln(20)

	// Net Income
	pdf.SetFont("Arial", "B", 14)
	pdf.SetFillColor(240, 240, 240)
	pdf.CellFormat(100, 12, "NET INCOME", "1", 0, "L", true, 0, "")
	pdf.CellFormat(40, 12, fmt.Sprintf("$%s", totalRev.Sub(totalExp).StringFixed(2)), "1", 0, "R", true, 0, "")

	var buf bytes.Buffer
	if err := pdf.Output(&buf); err != nil {
		return "", err
	}
	return base64.StdEncoding.EncodeToString(buf.Bytes()), nil
}

// Helper to render a section of accounts in the PDF.
func (c *CapitalBridge) renderPdfSection(pdf *gofpdf.Fpdf, title string, accounts []*ent.Account) {
	pdf.SetFont("Arial", "B", 12)
	pdf.Cell(40, 10, title)
	pdf.Ln(8)
	pdf.SetFont("Arial", "", 10)
	for _, a := range accounts {
		pdf.CellFormat(100, 8, a.Name, "", 0, "L", false, 0, "")
		pdf.CellFormat(40, 8, a.Balance.StringFixed(2), "", 0, "R", false, 0, "")
		pdf.Ln(6)
	}
}

// Helper to render a total line in the PDF.
func (c *CapitalBridge) renderPdfTotal(pdf *gofpdf.Fpdf, label string, amount decimal.Decimal) {
	pdf.SetFont("Arial", "B", 10)
	pdf.CellFormat(100, 10, label, "T", 0, "L", false, 0, "")
	pdf.CellFormat(40, 10, fmt.Sprintf("$%s", amount.StringFixed(2)), "T", 0, "R", false, 0, "")
}