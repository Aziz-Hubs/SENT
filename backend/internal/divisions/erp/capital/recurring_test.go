package capital

import (
	"context"
	"testing"
	"time"

	"sent/ent/account"
	"sent/ent/enttest"
	"sent/ent/journalentry"
	"sent/ent/transaction"

	_ "github.com/mattn/go-sqlite3"
	"github.com/riverqueue/river"
	"github.com/shopspring/decimal"
)

func TestRecurringInvoicePrecision(t *testing.T) {
	client := enttest.Open(t, "sqlite3", "file:ent?mode=memory&cache=shared&_fk=1")
	defer client.Close()
	ctx := context.Background()

	// 1. Setup Tenant and Accounts
	tenant := client.Tenant.Create().SetName("TestCorp").SetDomain("test.sent").SaveX(ctx)

	arAcc := client.Account.Create().
		SetTenant(tenant).
		SetName("Accounts Receivable").
		SetNumber("1200").
		SetType(account.TypeAsset).
		SetBalance(0).
		SaveX(ctx)

	revAcc := client.Account.Create().
		SetTenant(tenant).
		SetName("SaaS Subscription Revenue").
		SetNumber("4000").
		SetType(account.TypeRevenue).
		SetBalance(0).
		SaveX(ctx)

	// 2. Create Recurring Invoice Config
	// Set amount to a complex decimal to test precision over cycles
	// 99.99 * 1000 should be exactly 99990.00
	amount := 99.99
	ri := client.RecurringInvoice.Create().
		SetTenant(tenant).
		SetAccount(revAcc).
		SetDescription("Monthly Gold Plan").
		SetAmount(amount).
		SetFrequency("monthly").
		SetNextRunDate(time.Now()).
		SaveX(ctx)

	worker := NewRecurringInvoiceWorker(client)

	// 3. Simulate 1,000 cycles
	iterations := 1000
	for i := 0; i < iterations; i++ {
		job := &river.Job[RecurringInvoiceArgs]{
			Args: RecurringInvoiceArgs{RecurringInvoiceID: ri.ID},
		}

		err := worker.Work(ctx, job)
		if err != nil {
			t.Fatalf("Worker failed at iteration %d: %v", i, err)
		}
	}

	// 4. Verify Final Balances with Decimal Math
	expectedTotal := decimal.NewFromFloat(amount).Mul(decimal.NewFromInt(int64(iterations)))

	finalArAcc := client.Account.GetX(ctx, arAcc.ID)
	finalRevAcc := client.Account.GetX(ctx, revAcc.ID)

	actualArBalance := decimal.NewFromFloat(finalArAcc.Balance)
	actualRevBalance := decimal.NewFromFloat(finalRevAcc.Balance)

	if !actualArBalance.Equal(expectedTotal) {
		t.Errorf("AR Balance Drift! Expected %s, got %s", expectedTotal, actualArBalance)
	}

	if !actualRevBalance.Equal(expectedTotal) {
		t.Errorf("Revenue Balance Drift! Expected %s, got %s", expectedTotal, actualRevBalance)
	}

	// 5. Verify Transaction Count
	count := client.Transaction.Query().CountX(ctx)
	if count != iterations {
		t.Errorf("Expected %d transactions, got %d", iterations, count)
	}

	// 6. Verify Journal Integrity
	entries := client.JournalEntry.Query().
		Where(journalentry.HasTransactionWith(transaction.DescriptionHasPrefix("Recurring Invoice"))).
		AllX(ctx)

	if len(entries) != iterations*2 {
		t.Errorf("Expected %d journal entries, got %d", iterations*2, len(entries))
	}
}
