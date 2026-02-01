package people

import (
	"context"
	"fmt"

	"sent/internal/divisions/erp/capital"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/shopspring/decimal"
)

// PayrollEngine handles the gross-to-net calculation pipeline.
type PayrollEngine struct {
	pool            *pgxpool.Pool
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
func NewPayrollEngine(pool *pgxpool.Pool, exchange *capital.ExchangeService) *PayrollEngine {
	return &PayrollEngine{
		pool:            pool,
		exchangeService: exchange,
	}
}

// CalculateMonthlyPayout computes the payout for an employee.
func (e *PayrollEngine) CalculateMonthlyPayout(ctx context.Context, empID int, localCurrency string) (*PayoutDetails, error) {
	var baseSalary float64
	var baseCurrency string

	err := e.pool.QueryRow(ctx, `
		SELECT c.base_salary, c.currency 
		FROM compensation_agreements c
		JOIN employees e ON c.id = (
			SELECT id FROM compensation_agreements 
			WHERE employee_id = $1 AND status = 'active' 
			LIMIT 1
		)
		WHERE e.id = $1`, empID).Scan(&baseSalary, &baseCurrency)

	if err != nil {
		return nil, fmt.Errorf("employee not found or no active agreement: %w", err)
	}

	// 1. Convert to local payout currency
	grossPayLocal, err := e.exchangeService.Convert(decimal.NewFromFloat(baseSalary), baseCurrency, localCurrency)
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
		EmployeeID:    empID,
		BaseSalaryUSD: decimal.NewFromFloat(baseSalary),
		GrossPayLocal: grossPayLocal,
		TaxDeductions: taxDeductions,
		NetPayLocal:   netPayLocal,
		Currency:      localCurrency,
	}, nil
}
