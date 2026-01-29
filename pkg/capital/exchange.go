package capital

import (
	"github.com/shopspring/decimal"
)

// ExchangeService handles currency conversions.
type ExchangeService struct{}

// NewExchangeService initializes a new ExchangeService.
func NewExchangeService() *ExchangeService {
	return &ExchangeService{}
}

// GetExchangeRate returns the exchange rate from fromCurrency to toCurrency.
// In a real scenario, this would fetch from an API or database.
func (s *ExchangeService) GetExchangeRate(from, to string) (decimal.Decimal, error) {
	// Mock implementation
	rates := map[string]map[string]float64{
		"USD": {
			"JOD": 0.709,
			"SAR": 3.75,
			"USD": 1.0,
		},
		"JOD": {
			"USD": 1.41,
			"SAR": 5.29,
			"JOD": 1.0,
		},
	}

	if fromRates, ok := rates[from]; ok {
		if rate, ok := fromRates[to]; ok {
			return decimal.NewFromFloat(rate), nil
		}
	}

	// Fallback/Default
	return decimal.NewFromFloat(1.0), nil
}

// Convert converts an amount from one currency to another.
func (s *ExchangeService) Convert(amount decimal.Decimal, from, to string) (decimal.Decimal, error) {
	rate, err := s.GetExchangeRate(from, to)
	if err != nil {
		return decimal.Zero, err
	}
	return amount.Mul(rate).RoundBank(2), nil
}
