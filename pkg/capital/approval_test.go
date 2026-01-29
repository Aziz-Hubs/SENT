package capital

import (
	"context"
	"testing"
	"time"

	"sent/ent/enttest"
	_ "github.com/mattn/go-sqlite3"
	"sent/ent/transaction"
	"sent/ent/journalentry"
	"sent/ent/account"
	"sent/ent/user"
	"github.com/stretchr/testify/assert"
)

func TestTransactionApprovalLimitsAndRoles(t *testing.T) {
	client := enttest.Open(t, "sqlite3", "file:ent?mode=memory&cache=shared&_fk=1")
	defer client.Close()
	ctx := context.Background()

	bridge := NewCapitalBridge(client)
	bridge.Startup(ctx)

	// 1. Setup Tenant and Accounts
	tenant, err := client.Tenant.Create().
		SetName("Test Tenant").
		SetDomain("test.com").
		SetTransactionLimit(1000.0).
		Save(ctx)
	assert.NoError(t, err)

	junior, err := client.User.Create().
		SetZitadelID("junior-id").
		SetEmail("junior@test.com").
		SetFirstName("Junior").
		SetRole("Junior Accountant").
		SetSeniority(user.SeniorityJunior).
		SetTenant(tenant).
		Save(ctx)
	assert.NoError(t, err)

	manager, err := client.User.Create().
		SetZitadelID("manager-id").
		SetEmail("manager@test.com").
		SetFirstName("Manager").
		SetRole("Finance Manager").
		SetSeniority(user.SeniorityExpert).
		SetTenant(tenant).
		Save(ctx)
	assert.NoError(t, err)

	cashAcc, err := client.Account.Create().
		SetName("Cash").
		SetNumber("1001").
		SetType(account.TypeAsset).
		SetTenant(tenant).
		SetBalance(50000.0).
		Save(ctx)
	assert.NoError(t, err)

	revAcc, err := client.Account.Create().
		SetName("Revenue").
		SetNumber("4001").
		SetType(account.TypeRevenue).
		SetTenant(tenant).
		SetBalance(0.0).
		Save(ctx)
	assert.NoError(t, err)

	// 2. Test Small Transaction by Junior (Auto-Approved)
	smallReq := TransactionRequest{
		Description: "Small Sale",
		Date:        time.Now(),
		UserID:      junior.ID,
		Entries: []EntryRequest{
			{AccountID: cashAcc.ID, Amount: 500.0, Direction: "debit"},
			{AccountID: revAcc.ID, Amount: 500.0, Direction: "credit"},
		},
	}

	msg, err := bridge.CreateTransaction(smallReq)
	assert.NoError(t, err)
	assert.Contains(t, msg, "posted")

	// Verify balance updated
	updatedCash, _ := client.Account.Get(ctx, cashAcc.ID)
	assert.Equal(t, 50500.0, updatedCash.Balance)

	// 3. Test Large Transaction by Junior (Staged)
	largeJuniorReq := TransactionRequest{
		Description: "Junior Large Sale",
		Date:        time.Now(),
		UserID:      junior.ID,
		Entries: []EntryRequest{
			{AccountID: cashAcc.ID, Amount: 10000.0, Direction: "debit"},
			{AccountID: revAcc.ID, Amount: 10000.0, Direction: "credit"},
		},
	}

	msg, err = bridge.CreateTransaction(largeJuniorReq)
	assert.NoError(t, err)
	assert.Contains(t, msg, "STAGED")

	// Verify balance NOT updated
	stagedCash, _ := client.Account.Get(ctx, cashAcc.ID)
	assert.Equal(t, 50500.0, stagedCash.Balance)

	// 4. Test Large Transaction by Manager (Auto-Approved - Bypass)
	largeManagerReq := TransactionRequest{
		Description: "Manager Large Sale",
		Date:        time.Now(),
		UserID:      manager.ID,
		Entries: []EntryRequest{
			{AccountID: cashAcc.ID, Amount: 10000.0, Direction: "debit"},
			{AccountID: revAcc.ID, Amount: 10000.0, Direction: "credit"},
		},
	}

	msg, err = bridge.CreateTransaction(largeManagerReq)
	assert.NoError(t, err)
	assert.Contains(t, msg, "posted")

	// Verify balance updated (50500 + 10000)
	finalCash, _ := client.Account.Get(ctx, cashAcc.ID)
	assert.Equal(t, 60500.0, finalCash.Balance)

	// 5. Approve the Staged Transaction
	txnStaged, _ := client.Transaction.Query().Where(transaction.Description("Junior Large Sale")).Only(ctx)
	msg, err = bridge.ApproveTransaction(txnStaged.ID)
	assert.NoError(t, err)
	assert.Contains(t, msg, "approved")

	// Verify balance updated (60500 + 10000)
	approvedCash, _ := client.Account.Get(ctx, cashAcc.ID)
	assert.Equal(t, 70500.0, approvedCash.Balance)

	// Verify JournalEntry status is now APPROVED
	je, _ := client.JournalEntry.Query().Where(journalentry.Description("Junior Large Sale")).First(ctx)
	assert.Equal(t, journalentry.ApprovalStatusAPPROVED, je.ApprovalStatus)
}
