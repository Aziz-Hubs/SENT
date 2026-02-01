package capital

import (
	"bytes"
	"context"
	"encoding/base64"
	"encoding/csv"
	"fmt"
	"time"

	"sent/internal/platform/auth"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/jung-kurt/gofpdf/v2"
	"github.com/shopspring/decimal"
)

// CapitalBridge serves as the interface for financial operations.
// It handles accounts, transactions, and reporting.
type CapitalBridge struct {
	ctx  context.Context
	db   *pgxpool.Pool
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

// ReportAccountRow represents a line in financial reports.
type ReportAccountRow struct {
	Name    string
	Balance decimal.Decimal
}

// NewCapitalBridge initializes a new CapitalBridge.
func NewCapitalBridge(db *pgxpool.Pool, auth *auth.AuthBridge) *CapitalBridge {
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

	rows, err := c.db.Query(c.ctx, "SELECT id, name, number, type, balance FROM accounts WHERE tenant_id = $1", tenantID)
	if err != nil {
		return nil, fmt.Errorf("failed to query accounts: %w", err)
	}
	defer rows.Close()

	var dtos []AccountDTO
	for rows.Next() {
		var a AccountDTO
		var bal decimal.Decimal
		if err := rows.Scan(&a.ID, &a.Name, &a.Number, &a.Type, &bal); err != nil {
			return nil, err
		}
		a.Balance, _ = bal.Float64()
		dtos = append(dtos, a)
	}

	if len(dtos) == 0 {
		if err := c.seedDefaultAccounts(tenantID); err != nil {
			return nil, err
		}
		return c.GetAccounts()
	}

	return dtos, nil
}

// seedDefaultAccounts creates a basic chart of accounts for a new system.
func (c *CapitalBridge) seedDefaultAccounts(tenantID int) error {
	// Check existence
	var exists bool
	err := c.db.QueryRow(c.ctx, "SELECT EXISTS(SELECT 1 FROM accounts WHERE tenant_id = $1)", tenantID).Scan(&exists)
	if err != nil && err != pgx.ErrNoRows {
		return err
	}
	if exists {
		return nil
	}

	// Create default accounts
	_, err = c.db.Exec(c.ctx, `
		INSERT INTO accounts (name, number, type, balance, tenant_id) VALUES 
		('Operating Cash', '1000', 'asset', 10000, $1),
		('Revenue', '4000', 'revenue', 0, $1),
		('Rent Expense', '5000', 'expense', 0, $1)`,
		tenantID)

	if err != nil {
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

	rows, err := c.db.Query(c.ctx, "SELECT id, description, date, total_amount, approval_status, reference FROM transactions WHERE tenant_id = $1", tenantID)
	if err != nil {
		return nil, fmt.Errorf("failed to query transactions: %w", err)
	}
	defer rows.Close()

	var dtos []TransactionDTO
	for rows.Next() {
		var t TransactionDTO
		var total decimal.Decimal
		if err := rows.Scan(&t.ID, &t.Description, &t.Date, &total, &t.ApprovalStatus, &t.Reference); err != nil {
			return nil, err
		}
		t.TotalAmount, _ = total.Float64()
		dtos = append(dtos, t)
	}
	return dtos, nil
}

// ApproveTransaction moves a STAGED transaction to APPROVED and updates account balances.
func (c *CapitalBridge) ApproveTransaction(transactionID int) (string, error) {
	prof, err := c.auth.GetUserProfile()
	if err != nil {
		return "", fmt.Errorf("authentication required: %w", err)
	}

	if prof.Role != "admin" && prof.Seniority != "expert" {
		return "", fmt.Errorf("insufficient seniority: transaction approval requires 'expert' status")
	}

	tx, err := c.db.Begin(c.ctx)
	if err != nil {
		return "", err
	}
	defer tx.Rollback(c.ctx)

	var currentStatus string
	err = tx.QueryRow(c.ctx, "SELECT approval_status FROM transactions WHERE id = $1 AND tenant_id = $2", transactionID, prof.TenantID).Scan(&currentStatus)
	if err != nil {
		return "", fmt.Errorf("transaction not found or access denied: %w", err)
	}

	if currentStatus != "STAGED" {
		return "", fmt.Errorf("transaction is not in a stageable status (STAGED)")
	}

	// 1. Update status
	_, err = tx.Exec(c.ctx, "UPDATE transactions SET approval_status = 'APPROVED' WHERE id = $1", transactionID)
	if err != nil {
		return "", err
	}

	_, err = tx.Exec(c.ctx, "UPDATE journal_entries SET approval_status = 'APPROVED' WHERE transaction_id = $1", transactionID)
	if err != nil {
		return "", err
	}

	// 2. Update balances
	rows, err := tx.Query(c.ctx, `
		SELECT l.id, l.amount, l.direction, a.id, a.balance 
		FROM ledger_entries l 
		JOIN accounts a ON l.account_id = a.id 
		WHERE l.transaction_id = $1`, transactionID)
	if err != nil {
		return "", err
	}
	defer rows.Close()

	type balanceUpdate struct {
		accountID int
		newBal    decimal.Decimal
	}
	var updates []balanceUpdate

	for rows.Next() {
		var entryID int
		var amount, balance decimal.Decimal
		var direction string
		var accountID int
		if err := rows.Scan(&entryID, &amount, &direction, &accountID, &balance); err != nil {
			return "", err
		}

		var newBal decimal.Decimal
		if direction == "debit" {
			newBal = balance.Add(amount)
		} else {
			newBal = balance.Sub(amount)
		}
		updates = append(updates, balanceUpdate{accountID, newBal})
	}

	for _, up := range updates {
		_, err = tx.Exec(c.ctx, "UPDATE accounts SET balance = $1 WHERE id = $2", up.newBal, up.accountID)
		if err != nil {
			return "", err
		}
	}

	if err := tx.Commit(c.ctx); err != nil {
		return "", err
	}

	return fmt.Sprintf("Transaction %d approved and balances updated.", transactionID), nil
}

// CreateTransaction records a new financial transaction with multiple ledger entries.
func (c *CapitalBridge) CreateTransaction(req TransactionRequest) (string, error) {
	if err := validateBalance(req.Entries); err != nil {
		return "", err
	}

	prof, err := c.auth.GetUserProfile()
	if err != nil {
		return "", err
	}
	tenantID := prof.TenantID

	tx, err := c.db.Begin(c.ctx)
	if err != nil {
		return "", fmt.Errorf("failed to start transaction: %w", err)
	}
	defer tx.Rollback(c.ctx)

	var txLimit decimal.Decimal
	err = tx.QueryRow(c.ctx, "SELECT transaction_limit FROM tenants WHERE id = $1", tenantID).Scan(&txLimit)
	if err != nil {
		return "", fmt.Errorf("tenant session invalid: %w", err)
	}

	var userRole string
	err = tx.QueryRow(c.ctx, "SELECT role FROM users WHERE id = $1 AND tenant_id = $2", req.UserID, tenantID).Scan(&userRole)
	if err != nil {
		return "", fmt.Errorf("unauthorized user context: %w", err)
	}

	totalAmount := decimal.Zero
	for _, e := range req.Entries {
		if e.Direction == "debit" {
			totalAmount = totalAmount.Add(decimal.NewFromFloat(e.Amount))
		}
	}

	approvalStatus := "APPROVED"
	if totalAmount.GreaterThan(txLimit) {
		if userRole != "Finance Manager" && userRole != "admin" {
			approvalStatus = "STAGED"
			fmt.Printf("[SENTchat] ALERT: Transaction '%s' ($%s) created by %d exceeds limit ($%s). Staging for manager approval.\n",
				req.Description, totalAmount, req.UserID, txLimit)
		}
	}

	// 1. Create Header
	var txnID int
	err = tx.QueryRow(c.ctx, `
		INSERT INTO transactions (description, date, tenant_id, total_amount, approval_status) 
		VALUES ($1, $2, $3, $4, $5) RETURNING id`,
		req.Description, req.Date, tenantID, totalAmount, approvalStatus).Scan(&txnID)
	if err != nil {
		return "", fmt.Errorf("failed to save transaction header: %w", err)
	}

	// 2. Create Entries and Update Balances
	for _, e := range req.Entries {
		decimalAmount := decimal.NewFromFloat(e.Amount)

		_, err = tx.Exec(c.ctx, `
			INSERT INTO journal_entries (amount, direction, account_id, transaction_id, tenant_id, description, approval_status) 
			VALUES ($1, $2, $3, $4, $5, $6, $7)`,
			decimalAmount, e.Direction, e.AccountID, txnID, tenantID, req.Description, approvalStatus)
		if err != nil {
			return "", fmt.Errorf("failed to save journal entry: %w", err)
		}

		_, err = tx.Exec(c.ctx, `
			INSERT INTO ledger_entries (amount, direction, account_id, transaction_id, tenant_id) 
			VALUES ($1, $2, $3, $4, $5)`,
			decimalAmount, e.Direction, e.AccountID, txnID, tenantID)
		if err != nil {
			return "", fmt.Errorf("failed to save ledger entry: %w", err)
		}

		if approvalStatus == "APPROVED" {
			var currentBal decimal.Decimal
			err = tx.QueryRow(c.ctx, "SELECT balance FROM accounts WHERE id = $1", e.AccountID).Scan(&currentBal)
			if err != nil {
				return "", err
			}

			var newBal decimal.Decimal
			if e.Direction == "debit" {
				newBal = currentBal.Add(decimalAmount)
			} else {
				newBal = currentBal.Sub(decimalAmount)
			}

			_, err = tx.Exec(c.ctx, "UPDATE accounts SET balance = $1 WHERE id = $2", newBal, e.AccountID)
			if err != nil {
				return "", fmt.Errorf("failed to update account balance: %w", err)
			}
		}
	}

	if err := tx.Commit(c.ctx); err != nil {
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
	rows, err := c.db.Query(c.ctx, "SELECT number, name, balance FROM accounts ORDER BY number ASC")
	if err != nil {
		return "", err
	}
	defer rows.Close()

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
	for rows.Next() {
		var number, name string
		var balance decimal.Decimal
		if err := rows.Scan(&number, &name, &balance); err != nil {
			return "", err
		}
		pdf.CellFormat(30, 10, number, "1", 0, "L", false, 0, "")
		pdf.CellFormat(100, 10, name, "1", 0, "L", false, 0, "")
		pdf.CellFormat(40, 10, balance.StringFixed(2), "1", 0, "R", false, 0, "")
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
	rows, err := c.db.Query(c.ctx, "SELECT name, type, balance FROM accounts WHERE type IN ('revenue', 'expense')")
	if err != nil {
		return "", err
	}
	defer rows.Close()

	var revenues, expenses []ReportAccountRow
	totalRev := decimal.Zero
	totalExp := decimal.Zero

	for rows.Next() {
		var name, accType string
		var balance decimal.Decimal
		if err := rows.Scan(&name, &accType, &balance); err != nil {
			return "", err
		}
		if accType == "revenue" {
			revenues = append(revenues, ReportAccountRow{name, balance})
			totalRev = totalRev.Add(balance)
		} else if accType == "expense" {
			expenses = append(expenses, ReportAccountRow{name, balance})
			totalExp = totalExp.Add(balance)
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
func (c *CapitalBridge) renderPdfSection(pdf *gofpdf.Fpdf, title string, accounts []ReportAccountRow) {
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
