package capital

import (
	"context"
	"testing"

	"sent/ent/enttest"
	"sent/ent/migrate"
	"sent/ent/account"

	_ "github.com/mattn/go-sqlite3"
)

func TestConsolidatedTrialBalance(t *testing.T) {
	client := enttest.Open(t, "sqlite3", "file:ent?mode=memory&cache=shared&_fk=1", enttest.WithMigrateOptions(migrate.WithGlobalUniqueID(true)))
	defer client.Close()
	ctx := context.Background()

	// 1. Setup Hierarchy
	parent := client.Tenant.Create().SetName("SENT Corp").SetDomain("sent.corp").SaveX(ctx)
	compA := client.Tenant.Create().SetName("SENT UK").SetDomain("uk.sent.corp").SetParent(parent).SaveX(ctx)
	compB := client.Tenant.Create().SetName("SENT JO").SetDomain("jo.sent.corp").SetParent(parent).SaveX(ctx)

	// 2. Setup Accounts
	// Company A Accounts
	revA := client.Account.Create().SetTenant(compA).SetName("Revenue").SetNumber("4000").SetType(account.TypeRevenue).SaveX(ctx)
	icRecA := client.Account.Create().SetTenant(compA).SetName("Due from SENT JO").SetNumber("1200").SetType(account.TypeAsset).SetIsIntercompany(true).SaveX(ctx)

	// Company B Accounts
	expB := client.Account.Create().SetTenant(compB).SetName("IT Expense").SetNumber("5000").SetType(account.TypeExpense).SaveX(ctx)
	icPayB := client.Account.Create().SetTenant(compB).SetName("Due to SENT UK").SetNumber("2200").SetType(account.TypeLiability).SetIsIntercompany(true).SaveX(ctx)

	// 3. Record Inter-company Transaction ($100 sale from A to B)
	// Company A Side
	client.Account.UpdateOne(revA).SetBalance(100).ExecX(ctx)
	client.Account.UpdateOne(icRecA).SetBalance(100).ExecX(ctx)

	// Company B Side
	client.Account.UpdateOne(expB).SetBalance(100).ExecX(ctx)
	client.Account.UpdateOne(icPayB).SetBalance(100).ExecX(ctx)

	worker := NewConsolidationWorker(client)
	balances, err := worker.GenerateConsolidatedTrialBalance(ctx, parent.ID)
	if err != nil {
		t.Fatalf("failed to generate consolidated balance: %v", err)
	}

	// 4. Verify Eliminations
	// Inter-company debt accounts (IC Receivable and IC Payable) should be missing from the results
	for _, b := range balances {
		if b.AccountNumber == "1200" || b.AccountNumber == "2200" {
			t.Errorf("Account %s should have been eliminated", b.AccountNumber)
		}
	}

	// Check if we still have the other accounts
	foundRev := false
	foundExp := false
	for _, b := range balances {
		if b.AccountNumber == "4000" {
			foundRev = true
			if b.TotalBalance != 100 {
				t.Errorf("Expected consolidated revenue 100, got %f", b.TotalBalance)
			}
		}
		if b.AccountNumber == "5000" {
			foundExp = true
			if b.TotalBalance != 100 {
				t.Errorf("Expected consolidated expense 100, got %f", b.TotalBalance)
			}
		}
	}

	if !foundRev || !foundExp {
		t.Error("External accounts not found in consolidation")
	}
}
