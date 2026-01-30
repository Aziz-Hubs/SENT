package people

import (
	"context"
	"fmt"
	"sent/ent"
	"sent/ent/compensationagreement"
	"sent/ent/employee"
	"sent/pkg/capital"
	"github.com/shopspring/decimal"
)

// PayrollEngine handles the gross-to-net calculation pipeline.
type PayrollEngine struct {
	db              *ent.Client
	exchangeService *capital.ExchangeService
}

// PayoutDetails represents the results of a payroll calculation.
type PayoutDetails struct {
	EmployeeID    int             `json:"employee_id"`
	BaseSalaryUSD decimal.Decimal `json:"base_salary_usd"`
	GrossPayLocal decimal.Decimal `json:"gross_pay_local"`
	TaxDeductions decimal.Decimal `json:"tax_deductions"`
	NetPayLocal   decimal.Decimal `json:"net_pay_local"`
	Currency      string          `json:"currency"`
}

// NewPayrollEngine initializes a new PayrollEngine.
func NewPayrollEngine(db *ent.Client, exchange *capital.ExchangeService) *PayrollEngine {
	return &PayrollEngine{
		db:              db,
		exchangeService: exchange,
	}
}

// CalculateMonthlyPayout computes the payout for an employee.
func (e *PayrollEngine) CalculateMonthlyPayout(ctx context.Context, empID int, localCurrency string) (*PayoutDetails, error) {
	emp, err := e.db.Employee.Query().
		Where(employee.ID(empID)).
		WithCompensationAgreements(func(q *ent.CompensationAgreementQuery) {
			q.Where(compensationagreement.StatusEQ(compensationagreement.StatusACTIVE))
		}).
		Only(ctx)
	if err != nil {
		return nil, fmt.Errorf("employee not found or no active agreement: %w", err)
	}

	if len(emp.Edges.CompensationAgreements) == 0 {
		return nil, fmt.Errorf("no active compensation agreement for employee %d", empID)
	}

	agreement := emp.Edges.CompensationAgreements[0]
	baseSalary := agreement.BaseSalary
	baseCurrency := agreement.Currency

	// 1. Convert to local payout currency
	grossPayLocal, err := e.exchangeService.Convert(baseSalary, baseCurrency, localCurrency)
	if err != nil {
		return nil, fmt.Errorf("currency conversion failed: %w", err)
	}

	// 2. Apply local tax adapters
	taxRates := map[string]decimal.Decimal{
		"JOD": decimal.NewFromFloat(0.07), // 7% SS for Jordan
		"SAR": decimal.NewFromFloat(0.09), // 9% GOSI for KSA
		"USD": decimal.NewFromFloat(0.15), // 15% Federal (Simplified)
	}

	taxRate, ok := taxRates[localCurrency]
	if !ok {
		taxRate = decimal.NewFromFloat(0.10) // Fallback 10% Flat
	}

	taxDeductions := grossPayLocal.Mul(taxRate).RoundBank(2)
	netPayLocal := grossPayLocal.Sub(taxDeductions)

	return &PayoutDetails{
		EmployeeID:    emp.ID,
		BaseSalaryUSD: baseSalary, // Assuming base might be USD
		GrossPayLocal: grossPayLocal,
		TaxDeductions: taxDeductions,
		NetPayLocal:   netPayLocal,
		Currency:      localCurrency,
	}, nil
}
