package testsuite

import (
	"context"
	"fmt"
	"log"
	"math/rand"
	"sent/ent"
	"sent/ent/account"
	"sent/ent/department"
	"sent/ent/employee"
	"sent/ent/journalentry"
	"sent/ent/stockmovement"
	"sent/ent/tenant"
	"sent/ent/agent"
	"sent/ent/asset"
	"sent/ent/assettype"
	"sent/ent/calllog"
	"sent/ent/strategicroadmap"
	"sent/ent/transaction"
	"sent/ent/user"
	"sent/ent/permission"
	"sent/ent/product"
	"sent/ent/inventoryreservation"
	"sent/ent/servicerate"
	"time"

	"github.com/brianvoe/gofakeit/v6"
	"github.com/shopspring/decimal"
)

type ComprehensiveSeeder struct {
	client   *ent.Client
	ctx      context.Context
	tenant   *ent.Tenant
	users    []*ent.User
	employees []*ent.Employee
	departments []*ent.Department
	accounts []*ent.Account
	products []*ent.Product
}

func NewComprehensiveSeeder(client *ent.Client) *ComprehensiveSeeder {
	return &ComprehensiveSeeder{
		client: client,
		ctx:    context.Background(),
	}
}

// SeedAll seeds all database schemas with realistic fake data
func (s *ComprehensiveSeeder) SeedAll() error {
	fmt.Println("🌱 [COMPREHENSIVE SEEDER] Starting complete database seeding...")
	
	// Initialize random seed
	gofakeit.Seed(time.Now().UnixNano())
	
	// 1. Core Infrastructure
	if err := s.seedTenant(); err != nil {
		return fmt.Errorf("tenant seeding failed: %w", err)
	}
	
	// 2. Identity & Access
	if err := s.seedUsers(); err != nil {
		return fmt.Errorf("users seeding failed: %w", err)
	}
	
	if err := s.seedPermissions(); err != nil {
		return fmt.Errorf("permissions seeding failed: %w", err)
	}
	
	// 3. HR & People (SENTpeople)
	if err := s.seedDepartments(); err != nil {
		return fmt.Errorf("departments seeding failed: %w", err)
	}
	
	if err := s.seedEmployees(); err != nil {
		return fmt.Errorf("employees seeding failed: %w", err)
	}
	
	if err := s.seedCompensationAgreements(); err != nil {
		return fmt.Errorf("compensation agreements seeding failed: %w", err)
	}
	
	if err := s.seedSuccessionMaps(); err != nil {
		return fmt.Errorf("succession maps seeding failed: %w", err)
	}
	
	// 4. Finance & Accounting (SENTcapital)
	if err := s.seedAccounts(); err != nil {
		return fmt.Errorf("accounts seeding failed: %w", err)
	}
	
	if err := s.seedTransactions(); err != nil {
		return fmt.Errorf("transactions seeding failed: %w", err)
	}
	
	if err := s.seedJournalEntries(); err != nil {
		return fmt.Errorf("journal entries seeding failed: %w", err)
	}
	
	if err := s.seedBudgetForecasts(); err != nil {
		return fmt.Errorf("budget forecasts seeding failed: %w", err)
	}
	
	// 5. Inventory & Stock (SENTstock)
	if err := s.seedProducts(); err != nil {
		return fmt.Errorf("products seeding failed: %w", err)
	}
	
	if err := s.seedStockMovements(); err != nil {
		return fmt.Errorf("stock movements seeding failed: %w", err)
	}
	
	if err := s.seedInventoryReservations(); err != nil {
		return fmt.Errorf("inventory reservations seeding failed: %w", err)
	}
	
	// 6. Billing & Revenue (SENTpilot)
	if err := s.seedServiceRates(); err != nil {
		return fmt.Errorf("service rates seeding failed: %w", err)
	}
	
	if err := s.seedRecurringInvoices(); err != nil {
		return fmt.Errorf("recurring invoices seeding failed: %w", err)
	}
	
	// 7. IT Asset Management (SENTnexus)
	if err := s.seedAssets(); err != nil {
		return fmt.Errorf("assets seeding failed: %w", err)
	}
	
	if err := s.seedCredentials(); err != nil {
		return fmt.Errorf("credentials seeding failed: %w", err)
	}
	
	if err := s.seedDiscoveryEntries(); err != nil {
		return fmt.Errorf("discovery entries seeding failed: %w", err)
	}
	
	// 8. Network Infrastructure (SENTnexus)
	if err := s.seedNetworkDevices(); err != nil {
		return fmt.Errorf("network devices seeding failed: %w", err)
	}
	
	if err := s.seedNetworkBackups(); err != nil {
		return fmt.Errorf("network backups seeding failed: %w", err)
	}
	
	// 9. Security & Surveillance (SENToptic)
	if err := s.seedCameras(); err != nil {
		return fmt.Errorf("cameras seeding failed: %w", err)
	}
	
	if err := s.seedDetectionEvents(); err != nil {
		return fmt.Errorf("detection events seeding failed: %w", err)
	}
	
	// 10. SaaS Management (SENTcontrol)
	if err := s.seedSaaSApps(); err != nil {
		return fmt.Errorf("saas apps seeding failed: %w", err)
	}
	
	if err := s.seedSaaSIdentities(); err != nil {
		return fmt.Errorf("saas identities seeding failed: %w", err)
	}
	
	// 11. Communications (SENTpilot)
	if err := s.seedCallLogs(); err != nil {
		return fmt.Errorf("call logs seeding failed: %w", err)
	}
	
	if err := s.seedVoicemails(); err != nil {
		return fmt.Errorf("voicemails seeding failed: %w", err)
	}
	
	if err := s.seedIVRFlows(); err != nil {
		return fmt.Errorf("ivr flows seeding failed: %w", err)
	}
	
	// 12. Document Management (SENTvault)
	if err := s.seedVaultItems(); err != nil {
		return fmt.Errorf("vault items seeding failed: %w", err)
	}
	
	if err := s.seedSOPs(); err != nil {
		return fmt.Errorf("sops seeding failed: %w", err)
	}
	
	// 13. Strategy & Planning (SENThorizon)
	if err := s.seedStrategicRoadmaps(); err != nil {
		return fmt.Errorf("strategic roadmaps seeding failed: %w", err)
	}
	
	// 14. Monitoring & Pulse (SENTpulse)
	if err := s.seedAgents(); err != nil {
		return fmt.Errorf("agents seeding failed: %w", err)
	}
	
	if err := s.seedHealthScoreSnapshots(); err != nil {
		return fmt.Errorf("health score snapshots seeding failed: %w", err)
	}
	
	// 15. Audit & Compliance
	if err := s.seedAuditLogs(); err != nil {
		return fmt.Errorf("audit logs seeding failed: %w", err)
	}
	
	if err := s.seedContracts(); err != nil {
		return fmt.Errorf("contracts seeding failed: %w", err)
	}
	
	fmt.Println("✅ [COMPREHENSIVE SEEDER] All schemas seeded successfully!")
	return nil
}

// 1. Core Infrastructure
func (s *ComprehensiveSeeder) seedTenant() error {
	fmt.Println("  📦 Seeding Tenant...")
	
	t, err := s.client.Tenant.Query().Where(tenant.NameEQ("Acuative Corporation")).Only(s.ctx)
	if err != nil {
		t, err = s.client.Tenant.Create().
			SetName("Acuative Corporation").
			SetDomain("acuative.com").
			SetActive(true).
			SetTransactionLimit(decimal.NewFromFloat(1000000.0)).
			Save(s.ctx)
		if err != nil {
			return err
		}
	}
	s.tenant = t
	return nil
}

// 2. Identity & Access
func (s *ComprehensiveSeeder) seedUsers() error {
	fmt.Println("  👥 Seeding Users (100)...")
	
	count, _ := s.client.User.Query().Where(user.HasTenantWith(tenant.ID(s.tenant.ID))).Count(s.ctx)
	if count >= 100 {
		fmt.Println("   - Users already seeded. Loading existing...")
		allUsers, _ := s.client.User.Query().Where(user.HasTenantWith(tenant.ID(s.tenant.ID))).Limit(100).All(s.ctx)
		s.users = allUsers
		return nil
	}

	for i := 0; i < 100; i++ {
		u, err := s.client.User.Create().
			SetTenant(s.tenant).
			SetZitadelID(gofakeit.UUID()).
			SetEmail(gofakeit.Email()).
			SetFirstName(gofakeit.FirstName()).
			SetLastName(gofakeit.LastName()).
			SetJobTitle(gofakeit.JobTitle()).
			SetDepartment(gofakeit.JobDescriptor()).
			SetRole(randomRole()).
			SetSeniority(randomSeniority()).
			SetMaxWip(rand.Intn(5) + 1).
			Save(s.ctx)
		if err != nil {
			log.Printf("Warning: failed to create user: %v", err)
			continue
		}
		s.users = append(s.users, u)
	}
	
	// Reload all users to ensure consistency
	allUsers, err := s.client.User.Query().Where(user.HasTenantWith(tenant.ID(s.tenant.ID))).All(s.ctx)
	if err == nil {
		s.users = allUsers
	}
	return nil
}

func (s *ComprehensiveSeeder) seedPermissions() error {
	fmt.Println("  🔐 Seeding Permissions...")
	
	permissions := []struct {
		name string
		code string
	}{
		{"Capital Read", "capital:read"},
		{"Capital Write", "capital:write"},
		{"Stock Read", "stock:read"},
		{"Stock Write", "stock:write"},
		{"People Admin", "people:admin"},
		{"Vault Read", "vault:read"},
		{"Vault Write", "vault:write"},
		{"Admin Full", "admin:full"},
	}
	
	for _, p := range permissions {
		exists, _ := s.client.Permission.Query().
			Where(permission.NameEQ(p.name), permission.HasTenantWith(tenant.ID(s.tenant.ID))).
			Exist(s.ctx)
		if exists {
			continue
		}
		_, err := s.client.Permission.Create().
			SetTenant(s.tenant).
			SetName(p.name).
			SetCode(p.code).
			Save(s.ctx)
		if err != nil {
			log.Printf("Warning: failed to create permission %s: %v", p.code, err)
		}
	}
	return nil
}

// 3. HR & People
func (s *ComprehensiveSeeder) seedDepartments() error {
	fmt.Println("  🏢 Seeding Departments...")
	
	depts := []struct {
		name string
		code string
		desc string
	}{
		{"Engineering", "ENG", "Software Development & Infrastructure"},
		{"Sales", "SALES", "Revenue Generation & Client Relations"},
		{"Marketing", "MKT", "Brand & Growth Marketing"},
		{"Finance", "FIN", "Accounting & Financial Planning"},
		{"Operations", "OPS", "Business Operations & Support"},
		{"Human Resources", "HR", "People & Culture"},
		{"Legal", "LEGAL", "Legal & Compliance"},
		{"Product", "PROD", "Product Management"},
	}
	
	for _, d := range depts {
		exists, _ := s.client.Department.Query().
			Where(department.CodeEQ(d.code), department.HasTenantWith(tenant.ID(s.tenant.ID))).
			Exist(s.ctx)
		
		var dept *ent.Department
		var err error
		
		if exists {
			dept, err = s.client.Department.Query().
				Where(department.CodeEQ(d.code), department.HasTenantWith(tenant.ID(s.tenant.ID))).
				Only(s.ctx)
		} else {
			dept, err = s.client.Department.Create().
				SetTenant(s.tenant).
				SetName(d.name).
				SetCode(d.code).
				SetDescription(d.desc).
				Save(s.ctx)
		}

		if err != nil {
			log.Printf("Warning: failed to handle department %s: %v", d.code, err)
			continue
		}
		s.departments = append(s.departments, dept)
	}
	return nil
}

func (s *ComprehensiveSeeder) seedEmployees() error {
	fmt.Println("  👔 Seeding Employees (80)...")
	
	for i := 0; i < 80; i++ {
		empID := fmt.Sprintf("EMP-%05d", 10000+i)
		exists, _ := s.client.Employee.Query().
			Where(employee.EmployeeIDEQ(empID), employee.HasTenantWith(tenant.ID(s.tenant.ID))).
			Exist(s.ctx)

		if exists {
			continue
		}

		var dept *ent.Department
		if len(s.departments) > 0 {
			dept = s.departments[rand.Intn(len(s.departments))]
		} else {
			// Try to fetch all departments if empty
			depts, _ := s.client.Department.Query().Where(department.HasTenantWith(tenant.ID(s.tenant.ID))).All(s.ctx)
			if len(depts) > 0 {
				s.departments = depts
				dept = s.departments[rand.Intn(len(s.departments))]
			}
		}
		
		emp := s.client.Employee.Create().
			SetTenant(s.tenant).
			SetZitadelID(gofakeit.UUID()).
			SetEmployeeID(empID).
			SetFirstName(gofakeit.FirstName()).
			SetLastName(gofakeit.LastName()).
			SetEmail(gofakeit.Email()).
			SetPhone(gofakeit.Phone()).
			SetStatus(employee.Status(randomEmployeeStatus())).
			SetSalaryEncrypted("ENCRYPTED_SALARY_DATA").
			SetBankDetailsEncrypted("ENCRYPTED_BANK_DATA").
			SetHipoStatus(rand.Float64() < 0.15)
		
		if dept != nil {
			emp.SetDepartment(dept)
		}
			
		u, err := emp.Save(s.ctx)
		if err != nil {
			log.Printf("Warning: failed to create employee: %v", err)
			continue
		}
		s.employees = append(s.employees, u)
	}
	
	// Reload employees
	allEmps, err := s.client.Employee.Query().Where(employee.HasTenantWith(tenant.ID(s.tenant.ID))).All(s.ctx)
	if err == nil {
		s.employees = allEmps
	}
	return nil
}

func (s *ComprehensiveSeeder) seedCompensationAgreements() error {
	fmt.Println("  💰 Seeding Compensation Agreements...")
	
	for _, emp := range s.employees {
		if emp.Status != employee.StatusACTIVE {
			continue
		}
		
		_, err := s.client.CompensationAgreement.Create().
			SetTenant(s.tenant).
			SetEmployee(emp).
			SetBaseSalary(decimal.NewFromFloat(gofakeit.Price(50000, 200000))).
			SetCurrency("USD").
			SetStatus("ACTIVE").
			SetEffectiveDate(time.Now().AddDate(0, -rand.Intn(24), 0)).
			Save(s.ctx)
		if err != nil {
			log.Printf("Warning: failed to create compensation agreement: %v", err)
		}
	}
	return nil
}

func (s *ComprehensiveSeeder) seedSuccessionMaps() error {
	fmt.Println("  🔄 Seeding Succession Maps...")
	
	for i := 0; i < 20 && i < len(s.employees)-1; i++ {
		_, err := s.client.SuccessionMap.Create().
			SetTenant(s.tenant).
			SetEmployee(s.employees[i]).
			SetBackupCandidate(s.employees[i+1]).
			SetReadinessLevel("EMERGENCY").
			Save(s.ctx)
		if err != nil {
			log.Printf("Warning: failed to create succession map: %v", err)
		}
	}
	return nil
}

// 4. Finance & Accounting
func (s *ComprehensiveSeeder) seedAccounts() error {
	fmt.Println("  💵 Seeding Chart of Accounts...")
	
	chartOfAccounts := []struct {
		name   string
		number string
		accType account.Type
	}{
		{"Cash", "1000", account.TypeAsset},
		{"Accounts Receivable", "1200", account.TypeAsset},
		{"Inventory", "1300", account.TypeAsset},
		{"Equipment", "1500", account.TypeAsset},
		{"Accounts Payable", "2000", account.TypeLiability},
		{"Unearned Revenue", "2100", account.TypeLiability},
		{"Common Stock", "3000", account.TypeEquity},
		{"Retained Earnings", "3100", account.TypeEquity},
		{"Service Revenue", "4000", account.TypeRevenue},
		{"Product Sales", "4100", account.TypeRevenue},
		{"Cost of Goods Sold", "5000", account.TypeExpense},
		{"Salaries Expense", "6000", account.TypeExpense},
		{"Rent Expense", "6100", account.TypeExpense},
		{"Utilities Expense", "6200", account.TypeExpense},
	}
	
	for _, acc := range chartOfAccounts {
		exists, _ := s.client.Account.Query().
			Where(account.NumberEQ(acc.number), account.HasTenantWith(tenant.ID(s.tenant.ID))).
			Exist(s.ctx)
		
		if exists {
			continue
		}
		
		accObj, err := s.client.Account.Create().
			SetTenant(s.tenant).
			SetName(acc.name).
			SetNumber(acc.number).
			SetType(acc.accType).
			SetBalance(decimal.NewFromFloat(gofakeit.Price(0, 100000))).
			SetIsIntercompany(rand.Float64() < 0.1).
			Save(s.ctx)
		if err != nil {
			log.Printf("Warning: failed to create account %s: %v", acc.number, err)
			continue
		}
		s.accounts = append(s.accounts, accObj)
	}
	
	// Reload accounts
	allAccounts, err := s.client.Account.Query().Where(account.HasTenantWith(tenant.ID(s.tenant.ID))).All(s.ctx)
	if err == nil {
		s.accounts = allAccounts
	}
	return nil
}

func (s *ComprehensiveSeeder) seedTransactions() error {
	fmt.Println("  📊 Seeding Transactions (500)...")
	
	if len(s.accounts) < 2 {
		return fmt.Errorf("need at least 2 accounts to create transactions")
	}
	
	for i := 0; i < 500; i++ {
		tx, err := s.client.Transaction.Create().
			SetTenant(s.tenant).
			SetDescription(gofakeit.Sentence(8)).
			SetDate(time.Now().AddDate(0, 0, -rand.Intn(365))).
			SetTotalAmount(decimal.NewFromFloat(gofakeit.Price(100, 50000))).
			SetType(randomTransactionType()).
			SetReference(fmt.Sprintf("TXN-%d", 100000+i)).
			SetUUID(gofakeit.UUID()).
			SetApprovalStatus(transaction.ApprovalStatus(randomApprovalStatus())).
			SetIsIntercompany(rand.Float64() < 0.05).
			Save(s.ctx)
		if err != nil {
			log.Printf("Warning: failed to create transaction: %v", err)
			continue
		}
		
		// Create balanced ledger entries
		amount := decimal.NewFromFloat(gofakeit.Price(100, 10000))
		debitAcc := s.accounts[rand.Intn(len(s.accounts))]
		creditAcc := s.accounts[rand.Intn(len(s.accounts))]
		
		s.client.LedgerEntry.Create().
			SetTenant(s.tenant).
			SetTransaction(tx).
			SetAccount(debitAcc).
			SetAmount(amount).
			SetDirection("debit").
			Save(s.ctx)
		
		s.client.LedgerEntry.Create().
			SetTenant(s.tenant).
			SetTransaction(tx).
			SetAccount(creditAcc).
			SetAmount(amount).
			SetDirection("credit").
			Save(s.ctx)
	}
	return nil
}

func (s *ComprehensiveSeeder) seedJournalEntries() error {
	fmt.Println("  📝 Seeding Journal Entries (100)...")
	
	if len(s.accounts) < 1 {
		return nil
	}
	
	for i := 0; i < 100; i++ {
		_, err := s.client.JournalEntry.Create().
			SetTenant(s.tenant).
			SetAccount(s.accounts[rand.Intn(len(s.accounts))]).
			SetAmount(decimal.NewFromFloat(gofakeit.Price(100, 10000))).
			SetDirection(journalentry.Direction(randomDirection())).
			SetDescription(gofakeit.Sentence(6)).
			SetCreatedAt(time.Now().AddDate(0, 0, -rand.Intn(180))).
			Save(s.ctx)
		if err != nil {
			log.Printf("Warning: failed to create journal entry: %v", err)
		}
	}
	return nil
}

func (s *ComprehensiveSeeder) seedBudgetForecasts() error {
	fmt.Println("  📈 Seeding Budget Forecasts...")
	
	for i := 0; i < 12; i++ {
		_, err := s.client.BudgetForecast.Create().
			SetTenant(s.tenant).
			SetYear(2026).
			SetMonth((i % 12) + 1).
			SetProjectedAmount(decimal.NewFromFloat(gofakeit.Price(10000, 500000))).
			Save(s.ctx)
		if err != nil {
			log.Printf("Warning: failed to create budget forecast: %v", err)
		}
	}
	return nil
}

// 5. Inventory & Stock
func (s *ComprehensiveSeeder) seedProducts() error {
	fmt.Println("  📦 Seeding Products (300)...")
	
	count, _ := s.client.Product.Query().Where(product.HasTenantWith(tenant.ID(s.tenant.ID))).Count(s.ctx)
	if count >= 300 {
		fmt.Println("   - Products already seeded. Loading existing...")
		existing, _ := s.client.Product.Query().Where(product.HasTenantWith(tenant.ID(s.tenant.ID))).Limit(300).All(s.ctx)
		s.products = existing
		return nil
	}
	
	for i := 0; i < 300; i++ {
		prod, err := s.client.Product.Create().
			SetTenant(s.tenant).
			SetSku(fmt.Sprintf("SKU-%s", gofakeit.UUID()[:8])).
			SetName(gofakeit.ProductName()).
			SetDescription(gofakeit.Sentence(10)).
			SetUnitCost(decimal.NewFromFloat(gofakeit.Price(10, 1000))).
			SetQuantity(decimal.NewFromFloat(float64(rand.Intn(500)))).
			Save(s.ctx)
		if err != nil {
			log.Printf("Warning: failed to create product: %v", err)
			continue
		}
		s.products = append(s.products, prod)
	}
	return nil
}

func (s *ComprehensiveSeeder) seedStockMovements() error {
	fmt.Println("  📊 Seeding Stock Movements (800)...")
	
	for _, prod := range s.products {
		// Create 2-3 movements per product
		numMovements := rand.Intn(2) + 2
		for i := 0; i < numMovements; i++ {
			qty := decimal.NewFromFloat(float64(rand.Intn(100) + 1))
			
			_, err := s.client.StockMovement.Create().
				SetTenant(s.tenant).
				SetProduct(prod).
				SetQuantity(qty).
				SetMovementType(stockmovement.MovementType(randomMovementType())).
				SetReason(gofakeit.Sentence(5)).
				SetUnitCost(decimal.NewFromFloat(gofakeit.Price(10, 500))).
				SetRemainingQuantity(qty).
				SetCalculatedCogs(decimal.NewFromFloat(gofakeit.Price(100, 5000))).
				Save(s.ctx)
			if err != nil {
				log.Printf("Warning: failed to create stock movement: %v", err)
			}
		}
	}
	return nil
}

func (s *ComprehensiveSeeder) seedInventoryReservations() error {
	fmt.Println("  🔒 Seeding Inventory Reservations...")
	
	// Check coverage
	count, _ := s.client.InventoryReservation.Query().Where(inventoryreservation.HasTenantWith(tenant.ID(s.tenant.ID))).Count(s.ctx)
	if count > 0 {
		return nil
	}
	
	for i := 0; i < 50 && i < len(s.products); i++ {
		_, err := s.client.InventoryReservation.Create().
			SetTenant(s.tenant).
			SetProduct(s.products[i]).
			SetQuantity(decimal.NewFromFloat(float64(rand.Intn(20) + 1))).
			SetExpiresAt(time.Now().AddDate(0, 0, rand.Intn(30)+1)).
			Save(s.ctx)
		if err != nil {
			log.Printf("Warning: failed to create inventory reservation: %v", err)
		}
	}
	return nil
}

// 6. Billing & Revenue
func (s *ComprehensiveSeeder) seedServiceRates() error {
	fmt.Println("  💳 Seeding Service Rates...")
	
	workTypes := []string{"consulting", "development", "support", "training", "infrastructure", "security"}
	
	for _, wt := range workTypes {
		exists, _ := s.client.ServiceRate.Query().
			Where(servicerate.WorkTypeEQ(wt), servicerate.HasTenantWith(tenant.ID(s.tenant.ID))).
			Exist(s.ctx)
		if exists {
			continue
		}
		
		_, err := s.client.ServiceRate.Create().
			SetTenant(s.tenant).
			SetWorkType(wt).
			SetRate(decimal.NewFromFloat(gofakeit.Price(100, 500))).
			Save(s.ctx)
		if err != nil {
			log.Printf("Warning: failed to create service rate: %v", err)
		}
	}
	return nil
}

func (s *ComprehensiveSeeder) seedRecurringInvoices() error {
	fmt.Println("  🔁 Seeding Recurring Invoices...")
	
	if len(s.accounts) < 1 {
		return nil
	}
	
	for i := 0; i < 30; i++ {
		_, err := s.client.RecurringInvoice.Create().
			SetTenant(s.tenant).
			SetAccount(s.accounts[rand.Intn(len(s.accounts))]).
			SetAmount(decimal.NewFromFloat(gofakeit.Price(500, 10000))).
			SetFrequency(randomFrequency()).
			SetNextRunDate(time.Now().AddDate(0, 0, rand.Intn(30))).
			SetIsActive(rand.Float64() < 0.8).
			SetDescription(gofakeit.Sentence(3)).
			Save(s.ctx)
		if err != nil {
			log.Printf("Warning: failed to create recurring invoice: %v", err)
		}
	}
	return nil
}

// 7. IT Asset Management
func (s *ComprehensiveSeeder) seedAssets() error {
	fmt.Println("  💻 Seeding IT Assets (400)...")
	
	// Create asset types first
	assetTypes := []string{"Laptop", "Desktop", "Server", "Monitor", "Phone", "Tablet"}
	var types []*ent.AssetType
	
	for _, at := range assetTypes {
		t, err := s.client.AssetType.Create().
			SetTenant(s.tenant).
			SetName(at).
			SetDescription(fmt.Sprintf("%s hardware", at)).
			Save(s.ctx)
		if err == nil {
			types = append(types, t)
		}
	}
	
	if len(types) == 0 {
		// Reload asset types
		types, _ = s.client.AssetType.Query().Where(assettype.HasTenantWith(tenant.ID(s.tenant.ID))).All(s.ctx)
		if len(types) == 0 {
			return fmt.Errorf("no asset types created or found")
		}
	}
	
	for i := 0; i < 400; i++ {
		var owner *ent.User
		if len(s.users) > 0 {
			owner = s.users[rand.Intn(len(s.users))]
		}
		
		assetMock := s.client.Asset.Create().
			SetTenant(s.tenant).
			SetType(types[rand.Intn(len(types))]).
			SetName(fmt.Sprintf("%s-%s", gofakeit.Company(), gofakeit.DigitN(4))).
			SetHardwareID(gofakeit.UUID()).
			SetSerialNumber(gofakeit.DigitN(12)).
			SetPurchaseDate(time.Now().AddDate(-rand.Intn(5), 0, 0)).
			SetWarrantyExpiry(time.Now().AddDate(rand.Intn(3), 0, 0)).
			SetStatus(asset.Status(randomAssetStatus()))
		
		if owner != nil {
			assetMock.SetOwner(owner)
		}
			
		_, err := assetMock.Save(s.ctx)
		if err != nil {
			log.Printf("Warning: failed to create asset: %v", err)
		}
	}
	return nil
}

func (s *ComprehensiveSeeder) seedCredentials() error {
	fmt.Println("  🔑 Seeding Credentials...")
	
	for i := 0; i < 100; i++ {
		_, err := s.client.Credential.Create().
			SetTenant(s.tenant).
			SetName(gofakeit.AppName()).
			SetUsername(gofakeit.Username()).
			SetPasswordEncrypted([]byte("ENCRYPTED_PASSWORD_DATA")).
			Save(s.ctx)
		if err != nil {
			log.Printf("Warning: failed to create credential: %v", err)
		}
	}
	return nil
}

func (s *ComprehensiveSeeder) seedDiscoveryEntries() error {
	fmt.Println("  🔍 Seeding Discovery Entries...")
	
	for i := 0; i < 200; i++ {
		_, err := s.client.DiscoveryEntry.Create().
			SetTenant(s.tenant).
			SetIP(gofakeit.IPv4Address()).
			SetHostname(gofakeit.DomainName()).
			SetMAC(gofakeit.MacAddress()).
			Save(s.ctx)
		if err != nil {
			log.Printf("Warning: failed to create discovery entry: %v", err)
		}
	}
	return nil
}

// 8. Network Infrastructure
func (s *ComprehensiveSeeder) seedNetworkDevices() error {
	fmt.Println("  🌐 Seeding Network Devices...")
	
	// deviceTypes := []string{"router", "switch", "firewall", "access_point"}
	
	for i := 0; i < 80; i++ {
		_, err := s.client.NetworkDevice.Create().
			SetTenant(s.tenant).
			SetName(fmt.Sprintf("%s-%s", gofakeit.Company(), gofakeit.DigitN(3))).
			SetIPAddress(gofakeit.IPv4Address()).
			SetVendor("generic").
			SetModel(gofakeit.AppName()).
			SetStatus("OFFLINE").
			Save(s.ctx)
		if err != nil {
			log.Printf("Warning: failed to create network device: %v", err)
		}
	}
	return nil
}

func (s *ComprehensiveSeeder) seedNetworkBackups() error {
	fmt.Println("  💾 Seeding Network Backups...")
	
	devices, _ := s.client.NetworkDevice.Query().Limit(10).All(s.ctx)
	if len(devices) == 0 {
		return nil
	}
	
	for i := 0; i < 50; i++ {
		dev := devices[rand.Intn(len(devices))]
		_, err := s.client.NetworkBackup.Create().
			SetTenant(s.tenant).
			SetDevice(dev).
			SetContentHash(gofakeit.UUID()).
			SetVaultPath(fmt.Sprintf("/backups/%s.conf", dev.Name)).
			SetCreatedAt(time.Now().AddDate(0, 0, -rand.Intn(30))).
			Save(s.ctx)
		if err != nil {
			log.Printf("Warning: failed to create network backup: %v", err)
		}
	}
	return nil
}

// 9. Security & Surveillance
func (s *ComprehensiveSeeder) seedCameras() error {
	fmt.Println("  📹 Seeding Cameras...")
	
	for i := 0; i < 40; i++ {
		_, err := s.client.Camera.Create().
			SetTenant(s.tenant).
			SetName(fmt.Sprintf("CAM-%03d", i+1)).
			SetIPAddress(gofakeit.IPv4Address()).
			SetRtspURL(fmt.Sprintf("rtsp://admin:pass@%s:554/live", gofakeit.IPv4Address())).
			Save(s.ctx)
		if err != nil {
			log.Printf("Warning: failed to create camera: %v", err)
		}
	}
	return nil
}

func (s *ComprehensiveSeeder) seedDetectionEvents() error {
	fmt.Println("  🚨 Seeding Detection Events...")
	
	cameras, _ := s.client.Camera.Query().Limit(10).All(s.ctx)
	if len(cameras) == 0 {
		return nil
	}
	
	for i := 0; i < 200; i++ {
		cam := cameras[rand.Intn(len(cameras))]
		_, err := s.client.DetectionEvent.Create().
			SetTenant(s.tenant).
			SetCamera(cam).
			SetLabel(randomEventType()).
			SetConfidence(gofakeit.Float64Range(0.5, 1.0)).
			SetTimestamp(time.Now().Add(-time.Duration(rand.Intn(72)) * time.Hour)).
			Save(s.ctx)
		if err != nil {
			log.Printf("Warning: failed to create detection event: %v", err)
		}
	}
	return nil
}

// 10. SaaS Management
func (s *ComprehensiveSeeder) seedSaaSApps() error {
	fmt.Println("  ☁️  Seeding SaaS Apps...")
	
	apps := []struct {
		name     string
		provider string
		category string
	}{
		{"Slack", "Slack Technologies", "communication"},
		{"GitHub", "GitHub Inc", "development"},
		{"Jira", "Atlassian", "project_management"},
		{"Salesforce", "Salesforce", "crm"},
		{"Zoom", "Zoom Video", "communication"},
		{"AWS", "Amazon", "infrastructure"},
		{"Google Workspace", "Google", "productivity"},
		{"Notion", "Notion Labs", "documentation"},
	}
	
	var saasApps []*ent.SaaSApp
	for _, app := range apps {
		a, err := s.client.SaaSApp.Create().
			SetTenant(s.tenant).
			SetName(app.name).
			SetProvider(app.provider).
			SetCategory(app.category).
			SetIsManaged(true).
			Save(s.ctx)
		if err != nil {
			log.Printf("Warning: failed to create saas app: %v", err)
			continue
		}
		saasApps = append(saasApps, a)
	}
	
	// Seed SaaS Filters
	for _, app := range saasApps {
		_, err := s.client.SaaSFilter.Create().
			SetTenant(s.tenant).
			SetApp(app).
			SetDomainPattern(fmt.Sprintf("*.%s.com", gofakeit.Word())).
            SetName(fmt.Sprintf("%s Filter", app.Name)).
			SetAction("BLOCK").
			Save(s.ctx)
		if err != nil {
			log.Printf("Warning: failed to create saas filter: %v", err)
		}
	}
	
	return nil
}

func (s *ComprehensiveSeeder) seedSaaSIdentities() error {
	fmt.Println("  👤 Seeding SaaS Identities...")
	
	apps, _ := s.client.SaaSApp.Query().All(s.ctx)
	if len(apps) == 0 || len(s.users) == 0 {
		return nil
	}
	
	for i := 0; i < 150; i++ {
		user := s.users[rand.Intn(len(s.users))]
		app := apps[rand.Intn(len(apps))]
		
		identity, err := s.client.SaaSIdentity.Create().
			SetTenant(s.tenant).
			SetApp(app).
			SetUser(user).
			SetExternalID(gofakeit.UUID()).
			SetEmail(user.Email).
			SetDisplayName(fmt.Sprintf("%s %s", user.FirstName, user.LastName)).
			SetCurrentPlan(randomSaaSPlan()).
			SetMfaEnabled(rand.Float64() < 0.6).
			SetLastLogin(time.Now().AddDate(0, 0, -rand.Intn(30))).
			Save(s.ctx)
		if err != nil {
			log.Printf("Warning: failed to create saas identity: %v", err)
			continue
		}
		
		// Create usage records
		_, err = s.client.SaaSUsage.Create().
			SetTenant(s.tenant).
			SetIdentity(identity).
			SetTimestamp(time.Now().AddDate(0, 0, -rand.Intn(7))).
			SetFeatureName(gofakeit.Word()).
			SetCount(rand.Intn(100)).
			Save(s.ctx)
		if err != nil {
			log.Printf("Warning: failed to create saas usage: %v", err)
		}
	}
	return nil
}

// 11. Communications
func (s *ComprehensiveSeeder) seedCallLogs() error {
	fmt.Println("  📞 Seeding Call Logs...")
	
	if len(s.users) == 0 {
		return nil
	}
	
	for i := 0; i < 300; i++ {
		direction := randomCallDirection()
		call := s.client.CallLog.Create().
			SetTenant(s.tenant).
			SetUser(s.users[rand.Intn(len(s.users))]).
			SetDirection(calllog.Direction(direction)).
			SetDuration(rand.Intn(3600)).
			SetStartTime(time.Now().AddDate(0, 0, -rand.Intn(30)))
		
		if direction == "inbound" {
			call.SetCaller(gofakeit.Phone()).SetCallee("Internal")
		} else {
			call.SetCaller("Internal").SetCallee(gofakeit.Phone())
		}
			
		_, err := call.Save(s.ctx)
		if err != nil {
			log.Printf("Warning: failed to create call log: %v", err)
		}
	}
	return nil
}

func (s *ComprehensiveSeeder) seedVoicemails() error {
	fmt.Println("  🎙️  Seeding Voicemails...")
	
	if len(s.users) == 0 {
		return nil
	}
	
	for i := 0; i < 80; i++ {
		_, err := s.client.Voicemail.Create().
			SetTenant(s.tenant).
			SetUser(s.users[rand.Intn(len(s.users))]).
			SetCaller(gofakeit.Phone()).
			SetDuration(rand.Intn(180)).
			SetTranscription(gofakeit.Sentence(20)).
			Save(s.ctx)
		if err != nil {
			log.Printf("Warning: failed to create voicemail: %v", err)
		}
	}
	return nil
}

func (s *ComprehensiveSeeder) seedIVRFlows() error {
	fmt.Println("  🔀 Seeding IVR Flows...")
	
	for i := 0; i < 10; i++ {
		_, err := s.client.IVRFlow.Create().
			SetTenant(s.tenant).
			SetName(fmt.Sprintf("IVR Flow %d", i+1)).
			SetNodes(map[string]interface{}{
				"steps": []string{"greeting", "menu", "routing"},
			}).
			Save(s.ctx)
		if err != nil {
			log.Printf("Warning: failed to create ivr flow: %v", err)
		}
	}
	return nil
}

// 12. Document Management
func (s *ComprehensiveSeeder) seedVaultItems() error {
	fmt.Println("  🗄️  Seeding Vault Items...")
	
	for i := 0; i < 150; i++ {
		_, err := s.client.VaultItem.Create().
			SetTenant(s.tenant).
			SetName(gofakeit.AppName()).
			SetPath(fmt.Sprintf("/documents/%s/%s", gofakeit.Word(), gofakeit.Word())).
			SetFileType(randomFileType()).
			SetSize(int64(rand.Intn(10000000))).
			SetEncrypted(rand.Float64() < 0.7).
			Save(s.ctx)
		if err != nil {
			log.Printf("Warning: failed to create vault item: %v", err)
		}
	}
	return nil
}

func (s *ComprehensiveSeeder) seedSOPs() error {
	fmt.Println("  📋 Seeding SOPs...")
	
	if len(s.users) == 0 {
		return nil
	}
	
	for i := 0; i < 40; i++ {
		_, err := s.client.SOP.Create().
			SetTenant(s.tenant).
			SetTitle(gofakeit.Sentence(4)).
			SetTitle(gofakeit.Sentence(4)).
			SetContent(map[string]interface{}{"body": gofakeit.Paragraph(3, 5, 10, "\n")}).
			SetAuthor(s.users[rand.Intn(len(s.users))]).
			SetVersion(rand.Intn(5)+1).
			Save(s.ctx)
		if err != nil {
			log.Printf("Warning: failed to create solo: %v", err)
		}
	}
	return nil
}

// 13. Strategy & Planning
func (s *ComprehensiveSeeder) seedStrategicRoadmaps() error {
	fmt.Println("  🗺️  Seeding Strategic Roadmaps...")
	
	for i := 0; i < 15; i++ {
		_, err := s.client.StrategicRoadmap.Create().
			SetTenant(s.tenant).
			SetProjectName(gofakeit.Sentence(5)).
			SetDescription(gofakeit.Paragraph(2, 3, 8, "\n")).
			SetTargetDate(time.Now().AddDate(0, rand.Intn(24), 0)).
			SetStatus(strategicroadmap.Status(randomRoadmapStatus())).
			Save(s.ctx)
		if err != nil {
			log.Printf("Warning: failed to create strategic roadmap: %v", err)
		}
	}
	return nil
}

// 14. Monitoring & Pulse
func (s *ComprehensiveSeeder) seedAgents() error {
	fmt.Println("  🤖 Seeding Monitoring Agents...")
	
	for i := 0; i < 150; i++ {
		_, err := s.client.Agent.Create().
			SetTenant(s.tenant).
			SetHostname(gofakeit.DomainName()).
			SetOs(randomOS()).
			SetArch(randomArch()).
			SetIP(gofakeit.IPv4Address()).
			SetMAC(gofakeit.MacAddress()).
			SetVersion(fmt.Sprintf("%d.%d.%d", rand.Intn(3)+1, rand.Intn(10), rand.Intn(20))).
			SetStatus(agent.Status(randomAgentStatus())).
			Save(s.ctx)
		if err != nil {
			log.Printf("Warning: failed to create agent: %v", err)
		}
	}
	return nil
}

func (s *ComprehensiveSeeder) seedHealthScoreSnapshots() error {
	fmt.Println("  💚 Seeding Health Score Snapshots...")
	
	for i := 0; i < 100; i++ {
		_, err := s.client.HealthScoreSnapshot.Create().
			SetTenant(s.tenant).
			SetOverallScore(gofakeit.Float64Range(0.0, 100.0)).
			SetPerformanceScore(gofakeit.Float64Range(0, 100)).
			SetSecurityScore(gofakeit.Float64Range(0, 100)).
			SetLifecycleScore(gofakeit.Float64Range(0, 100)).
			Save(s.ctx)
		if err != nil {
			log.Printf("Warning: failed to create health score snapshot: %v", err)
		}
	}
	return nil
}

// 15. Audit & Compliance
func (s *ComprehensiveSeeder) seedAuditLogs() error {
	fmt.Println("  📜 Seeding Audit Logs...")
	
	actions := []string{"user.login", "user.logout", "data.create", "data.update", "data.delete", "permission.grant", "permission.revoke"}
	apps := []string{"capital", "stock", "people", "vault", "admin", "pilot", "nexus"}
	
	for i := 0; i < 1000; i++ {
		_, err := s.client.AuditLog.Create().
			SetTenant(s.tenant).
			SetAppName(apps[rand.Intn(len(apps))]).
			SetAction(actions[rand.Intn(len(actions))]).
			SetActorID(gofakeit.UUID()).
			SetRemoteIP(gofakeit.IPv4Address()).
			SetPayload(map[string]interface{}{
				"resource": gofakeit.Word(),
				"details": gofakeit.Sentence(8),
			}).
			Save(s.ctx)
		if err != nil {
			log.Printf("Warning: failed to create audit log: %v", err)
		}
	}
	return nil
}

func (s *ComprehensiveSeeder) seedContracts() error {
	fmt.Println("  📄 Seeding Contracts...")
	
	for i := 0; i < 50; i++ {
		_, err := s.client.Contract.Create().
			SetTenant(s.tenant).
			SetName(gofakeit.Sentence(4)).
			SetType("flat_rate").
			SetStartDate(time.Now().AddDate(0, -rand.Intn(12), 0)).
			SetTotalHours(gofakeit.Float64Range(10, 100)).
			Save(s.ctx)
		if err != nil {
			log.Printf("Warning: failed to create contract: %v", err)
		}
	}
	return nil
}

// Helper functions for random data generation
func randomRole() string {
	roles := []string{"admin", "user", "manager", "analyst", "developer"}
	return roles[rand.Intn(len(roles))]
}

func randomSeniority() user.Seniority {
	levels := []user.Seniority{user.SeniorityJunior, user.SeniorityExpert}
	return levels[rand.Intn(len(levels))]
}

func randomEmployeeStatus() string {
	statuses := []string{"STAGED", "ACTIVE", "TERMINATED"}
	weights := []int{10, 80, 10}
	r := rand.Intn(100)
	if r < weights[0] {
		return statuses[0]
	} else if r < weights[0]+weights[1] {
		return statuses[1]
	}
	return statuses[2]
}

func randomTransactionType() string {
	types := []string{"sale", "refund", "manual_adjustment", "payment", "invoice"}
	return types[rand.Intn(len(types))]
}

func randomApprovalStatus() string {
	statuses := []string{"PENDING", "STAGED", "APPROVED", "REJECTED"}
	weights := []int{10, 15, 70, 5}
	r := rand.Intn(100)
	cumulative := 0
	for i, w := range weights {
		cumulative += w
		if r < cumulative {
			return statuses[i]
		}
	}
	return "APPROVED"
}

func randomDirection() string {
	directions := []string{"debit", "credit"}
	return directions[rand.Intn(len(directions))]
}

func randomBudgetCategory() string {
	categories := []string{"revenue", "expenses", "capex", "opex", "r&d", "marketing", "sales"}
	return categories[rand.Intn(len(categories))]
}

func randomMovementType() string {
	types := []string{"incoming", "outgoing", "manual"}
	return types[rand.Intn(len(types))]
}

func randomFrequency() string {
	frequencies := []string{"monthly", "quarterly", "annually"}
	return frequencies[rand.Intn(len(frequencies))]
}

func randomAssetStatus() string {
	statuses := []string{"active", "inactive", "maintenance", "retired"}
	return statuses[rand.Intn(len(statuses))]
}

func randomCameraStatus() string {
	statuses := []string{"online", "offline", "error"}
	weights := []int{80, 15, 5}
	r := rand.Intn(100)
	cumulative := 0
	for i, w := range weights {
		cumulative += w
		if r < cumulative {
			return statuses[i]
		}
	}
	return "online"
}

func randomEventType() string {
	types := []string{"motion", "person", "vehicle", "package", "intrusion"}
	return types[rand.Intn(len(types))]
}

func randomSaaSPlan() string {
	plans := []string{"free", "basic", "professional", "enterprise"}
	return plans[rand.Intn(len(plans))]
}

func randomCallDirection() string {
	directions := []string{"inbound", "outbound"}
	return directions[rand.Intn(len(directions))]
}

func randomFileType() string {
	types := []string{"pdf", "docx", "xlsx", "pptx", "txt", "jpg", "png"}
	return types[rand.Intn(len(types))]
}

func randomRoadmapStatus() string {
	statuses := []string{"planning", "in_progress", "completed", "on_hold"}
	return statuses[rand.Intn(len(statuses))]
}

func randomOS() string {
	oses := []string{"Linux", "Windows", "macOS", "FreeBSD"}
	return oses[rand.Intn(len(oses))]
}

func randomArch() string {
	arches := []string{"amd64", "arm64", "386"}
	return arches[rand.Intn(len(arches))]
}

func randomAgentStatus() string {
	statuses := []string{"online", "offline", "degraded"}
	weights := []int{75, 20, 5}
	r := rand.Intn(100)
	cumulative := 0
	for i, w := range weights {
		cumulative += w
		if r < cumulative {
			return statuses[i]
		}
	}
	return "online"
}
