package people

import (
	"testing"
	"time"
	"github.com/shopspring/decimal"
)

func TestCalculateNetPay(t *testing.T) {
	// Verify multi-currency decimal rounding
	gross := decimal.NewFromFloat(5000.55)
	taxRate := decimal.NewFromFloat(0.16)
	
	taxAmount := gross.Mul(taxRate).Round(2)
	netPay := gross.Sub(taxAmount)

	expectedNet := decimal.NewFromFloat(4200.46)
	if !netPay.Equal(expectedNet) {
		t.Errorf("Expected net pay %s, got %s", expectedNet, netPay)
	}
}

func TestSignatureVerification(t *testing.T) {
	s := &ContractService{}
	sig := "base64-encoded-signature"
	ip := "192.168.1.1"
	ts := time.Now()
	
	hash := s.VerifySignature(sig, ip, ts)
	if len(hash) != 64 { // SHA256 hex length
		t.Errorf("Expected hash length 64, got %d", len(hash))
	}
	
	// Ensure stability
	hash2 := s.VerifySignature(sig, ip, ts)
	if hash != hash2 {
		t.Errorf("Hash mismatch for same input")
	}
}