package testsuite

import (
	"context"
	"fmt"
	"log"
	"math/rand"
	"sent/ent"
	"sent/ent/tenant"
	"sent/ent/ticket"
	"time"

	"github.com/brianvoe/gofakeit/v6"
)

type Seeder struct {
	client *ent.Client
	ctx    context.Context
}

func NewSeeder(client *ent.Client) *Seeder {
	return &Seeder{
		client: client,
		ctx:    context.Background(),
	}
}

// AdversarialPayloads contains malicious strings for security testing.
var AdversarialPayloads = []string{
	"<script>alert('XSS')</script>",
	"'; DROP TABLE users; --",
	"admin' OR '1'='1",
	"../../../../etc/passwd",
	"; rm -rf /",
	"<img src=x onerror=alert(1)>",
	"{{7*7}}",                           // Server Side Template Injection
	"() { :;}; /bin/bash -c 'sleep 10'", // Shellshock
}

func (s *Seeder) getFakerString() string {
	if rand.Float64() < 0.10 { // 10% Adversarial
		return AdversarialPayloads[rand.Intn(len(AdversarialPayloads))]
	}
	return gofakeit.Sentence(3)
}

func (s *Seeder) Seed(recordCount int) error {
	fmt.Printf("[SEEDER] Starting global seed for %d records...\n", recordCount)

	// 1. Create a Master Tenant if none exists
	t, err := s.client.Tenant.Query().Where(tenant.NameEQ("Gold Master Corp")).Only(s.ctx)
	if err != nil {
		t, err = s.client.Tenant.Create().
			SetName("Gold Master Corp").
			SetDomain("goldmaster.sent").
			Save(s.ctx)
		if err != nil {
			return fmt.Errorf("failed to create master tenant: %w", err)
		}
	}

	// 2. Seed Users and Employees (SENTpeople)
	fmt.Println("[SEEDER] Seeding Users and Employees...")
	for i := 0; i < 60; i++ {
		u, err := s.client.User.Create().
			SetTenant(t).
			SetZitadelID(gofakeit.UUID()).
			SetEmail(gofakeit.Email()).
			SetFirstName(gofakeit.FirstName()).
			SetLastName(gofakeit.LastName()).
			SetJobTitle(s.getFakerString()).
			SetDepartment(gofakeit.JobDescriptor()).
			SetRole(gofakeit.JobLevel()).
			Save(s.ctx)
		if err != nil {
			log.Printf("Warning: failed to create user: %v", err)
			continue
		}

		// Also create an Employee record for SENTpeople payroll
		emp, err := s.client.Employee.Create().
			SetTenant(t).
			SetZitadelID(u.ZitadelID).
			SetEmployeeID(gofakeit.UUID()).
			SetFirstName(u.FirstName).
			SetLastName(u.LastName).
			SetEmail(u.Email).
			SetStatus("ACTIVE").
			SetSalaryEncrypted("ENCRYPTED_PLACEHOLDER").
			Save(s.ctx)
		if err == nil {
			// Add a CompensationAgreement
			_, _ = s.client.CompensationAgreement.Create().
				SetTenant(t).
				SetEmployee(emp).
				SetBaseSalary(gofakeit.Price(3000, 8000)).
				SetCurrency("USD").
				SetStatus("ACTIVE").
				Save(s.ctx)
		}
	}

	// 3. Seed Agents (SENTpulse)
	fmt.Println("[SEEDER] Seeding Agents...")
	for i := 0; i < 120; i++ {
		_, err := s.client.Agent.Create().
			SetTenant(t).
			SetHostname(gofakeit.DomainName()).
			SetOs("Linux").
			SetArch("amd64").
			SetIP(gofakeit.IPv4Address()).
			SetMAC(gofakeit.MacAddress()).
			SetVersion("1.2.4").
			SetStatus("online").
			Save(s.ctx)
		if err != nil {
			log.Printf("Warning: failed to create agent: %v", err)
		}
	}

	// 4. Seed Assets (SENTnexus)
	fmt.Println("[SEEDER] Seeding Assets...")
	at, _ := s.client.AssetType.Create().SetName("Server").SetDescription("Physical Server").Save(s.ctx)
	for i := 0; i < 600; i++ {
		_, err := s.client.Asset.Create().
			SetTenant(t).
			SetType(at).
			SetName(s.getFakerString()).
			SetHardwareID(gofakeit.UUID()).
			SetMetadata(map[string]interface{}{
				"vendor": gofakeit.Company(),
				"model":  gofakeit.AppName(),
				"notes":  s.getFakerString(),
			}).
			Save(s.ctx)
		if err != nil {
			log.Printf("Warning: failed to create asset: %v", err)
		}
	}

	// 5. Seed Tickets (SENTpilot)
	fmt.Println("[SEEDER] Seeding Tickets...")
	for i := 0; i < 550; i++ {
		priority := "p4"
		if rand.Float64() < 0.05 {
			priority = "p1"
		}

		_, err := s.client.Ticket.Create().
			SetTenant(t).
			SetRequester(t.QueryUsers().FirstX(s.ctx)). // Need a requester
			SetSubject(s.getFakerString()).
			SetDescription(s.getFakerString()).
			SetPriority(ticket.Priority(priority)).
			SetCreatedAt(time.Now()).
			Save(s.ctx)
		if err != nil {
			log.Printf("Warning: failed to create ticket: %v", err)
		}
	}

	// 6. Seed ERP - SENTstock
	fmt.Println("[SEEDER] Seeding Products (SENTstock)...")
	for i := 0; i < 200; i++ {
		// Adversarial Bin Location and Barcode
		binLoc := fmt.Sprintf("Aisle %d", rand.Intn(20))
		barcode := gofakeit.DigitN(12)
		
		if rand.Float64() < 0.15 {
			// Inject XSS into Bin Location and Barcode
			xss := "<script>alert('ERP-XSS')</script>"
			if rand.Intn(2) == 0 {
				binLoc = xss
			} else {
				barcode = xss
			}
		}

		_, err := s.client.Product.Create().
			SetTenant(t).
			SetSku(gofakeit.UUID()[:8]).
			SetName(gofakeit.ProductName()).
			SetUnitCost(gofakeit.Price(10, 500)).
			SetQuantity(float64(rand.Intn(100))).
			SetAttributes(map[string]interface{}{
				"bin_location": binLoc,
				"barcode":      barcode,
				"category":     gofakeit.JobTitle(),
			}).
			Save(s.ctx)
		if err != nil {
			log.Printf("Warning: failed to create product: %v", err)
		}
	}

	// 7. Seed ERP - SENTcapital
	fmt.Println("[SEEDER] Seeding Transactions (SENTcapital)...")
	
	// Create some accounts first
	acc1, _ := s.client.Account.Create().SetTenant(t).SetName("Operating Cash").SetNumber("1000").SetType("asset").Save(s.ctx)
	acc2, _ := s.client.Account.Create().SetTenant(t).SetName("Sales Revenue").SetNumber("4000").SetType("revenue").Save(s.ctx)
	
	// Specialized accounts for BillingSync
	s.client.Account.Create().SetTenant(t).SetName("Accounts Receivable").SetNumber("1200").SetType("asset").Save(s.ctx)
	s.client.Account.Create().SetTenant(t).SetName("Unearned Revenue").SetNumber("2100").SetType("liability").Save(s.ctx)
	s.client.Account.Create().SetTenant(t).SetName("Service Revenue").SetNumber("4000").SetType("revenue").Save(s.ctx)

	// Seed Service Rates
	s.client.ServiceRate.Create().SetTenant(t).SetWorkType("general").SetRate(150.0).SaveX(s.ctx)
	s.client.ServiceRate.Create().SetTenant(t).SetWorkType("security").SetRate(250.0).SaveX(s.ctx)
	s.client.ServiceRate.Create().SetTenant(t).SetWorkType("infrastructure").SetRate(200.0).SaveX(s.ctx)
	
	for i := 0; i < 300; i++ {
		memo := gofakeit.Sentence(5)
		vendor := gofakeit.Company()

		if rand.Float64() < 0.15 {
			// Inject SQLi probes into Memo and Vendor
			sqli := "' OR 1=1; --"
			if rand.Intn(2) == 0 {
				memo = sqli
			} else {
				vendor = sqli
			}
		}

		tx, err := s.client.Transaction.Create().
			SetTenant(t).
			SetDescription(fmt.Sprintf("Invoice: %s | Memo: %s", vendor, memo)).
			SetReference(fmt.Sprintf("INV-%d", rand.Intn(90000)+10000)).
			SetDate(time.Now().AddDate(0, 0, -rand.Intn(30))).
			Save(s.ctx)
		if err != nil {
			log.Printf("Warning: failed to create transaction: %v", err)
			continue
		}

		amount := gofakeit.Price(100, 5000)
		// Balanced entry
		s.client.LedgerEntry.Create().SetTenant(t).SetTransaction(tx).SetAccount(acc1).SetAmount(amount).SetDirection("debit").SaveX(s.ctx)
		s.client.LedgerEntry.Create().SetTenant(t).SetTransaction(tx).SetAccount(acc2).SetAmount(amount).SetDirection("credit").SaveX(s.ctx)
	}

	fmt.Println("[SEEDER] Global seed completed successfully.")
	return nil
}
