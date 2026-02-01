package stock

import (
	"fmt"
	stockdb "sent/internal/db/erp/stock/sqlc"
)

// LabelGenerator generates ZPL labels for products
type LabelGenerator struct{}

// NewLabelGenerator creates a new LabelGenerator
func NewLabelGenerator() *LabelGenerator {
	return &LabelGenerator{}
}

// GenerateZPL generates ZPL code for a product label
func (g *LabelGenerator) GenerateZPL(p stockdb.Product) string {
	// Simple ZPL template
	// ^XA = Start Format
	// ^FO = Field Origin
	// ^ADN = Font D, Normal
	// ^FD = Field Data
	// ^FS = Field Separator
	// ^XZ = End Format

	// Using Product struct directly if GetProduct returns Product, checking definition...
	// If GetProduct returns struct with fields, we use them.
	// Assuming p has Name and Sku.

	return fmt.Sprintf(`
^XA
^FO50,50^ADN,36,20^FD%s^FS
^FO50,100^ADN,18,10^FDSKU: %s^FS
^FO50,150^BY3
^BCN,100,Y,N,N
^FD%s^FS
^XZ
`, p.Name, p.Sku, p.Sku)
}
