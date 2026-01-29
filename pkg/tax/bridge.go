package tax

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"sent/ent"
)

// Default Tax Rates
const (
	TaxRateJO = 0.16
	TaxRateSA = 0.15
	TaxRateAE = 0.05
	TaxRateUS = 0.08
	TaxRateGB = 0.20
)

// TaxBridge handles tax calculations and fiscal compliance signatures.
type TaxBridge struct {
	ctx context.Context
	db  *ent.Client
}

// TaxResult represents the breakdown of a tax calculation.
type TaxResult struct {
	Subtotal  float64 `json:"subtotal"`
	TaxRate   float64 `json:"taxRate"`
	TaxAmount float64 `json:"taxAmount"`
	Total     float64 `json:"total"`
}

// TaxConfig represents country-specific tax configuration.
type TaxConfig struct {
	CountryCode string  `json:"countryCode"`
	DefaultRate float64 `json:"defaultRate"`
	IsFiscal    bool    `json:"isFiscal"`
}

// NewTaxBridge initializes a new TaxBridge.
func NewTaxBridge(db *ent.Client) *TaxBridge {
	return &TaxBridge{db: db}
}

// Startup initializes the bridge context.
func (t *TaxBridge) Startup(ctx context.Context) {
	t.ctx = ctx
}

// SignInvoice generates a cryptographic signature for an invoice XML.
// This is required for compliance with ZATCA (KSA) and JoFotara (Jordan).
//
// @param xmlData - The invoice data in XML format.
// @returns A signature string.
func (t *TaxBridge) SignInvoice(xmlData string) (string, error) {
	// TODO: In production, integrate with a real HSM or Key Management Service.
	hash := sha256.Sum256([]byte(xmlData))
	signature := hex.EncodeToString(hash[:])
	return fmt.Sprintf("SENT-SIGNED-%s", signature), nil
}

// CalculateTax computes the tax amount based on the country code.
//
// @param amount - The base amount.
// @param countryCode - The ISO country code (e.g., "JO", "SA").
// @returns The tax calculation result.
func (t *TaxBridge) CalculateTax(amount float64, countryCode string) (TaxResult, error) {
	rate := TaxRateJO // Default fallback

	switch countryCode {
	case "SA":
		rate = TaxRateSA
	case "AE":
		rate = TaxRateAE
	case "US":
		rate = TaxRateUS
	case "GB":
		rate = TaxRateGB
	}

	taxAmount := amount * rate
	
	return TaxResult{
		Subtotal:  amount,
		TaxRate:   rate,
		TaxAmount: taxAmount,
		Total:     amount + taxAmount,
	}, nil
}

// GetTaxConfig retrieves the supported tax configurations for various regions.
func (t *TaxBridge) GetTaxConfig() ([]TaxConfig, error) {
	return []TaxConfig{
		{CountryCode: "JO", DefaultRate: TaxRateJO, IsFiscal: true},
		{CountryCode: "SA", DefaultRate: TaxRateSA, IsFiscal: true},
		{CountryCode: "AE", DefaultRate: TaxRateAE, IsFiscal: true},
		{CountryCode: "US", DefaultRate: TaxRateUS, IsFiscal: false},
		{CountryCode: "GB", DefaultRate: TaxRateGB, IsFiscal: true},
	}, nil
}
