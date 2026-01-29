package stock

import (
	"fmt"
	"sent/ent"
)

type LabelGenerator struct{}

func NewLabelGenerator() *LabelGenerator {
	return &LabelGenerator{}
}

// GenerateZPL creates a Zebra Programming Language string for a product label
func (g *LabelGenerator) GenerateZPL(p *ent.Product) string {
	// Simple ZPL template
	// ^XA - Start Format
	// ^FO - Field Origin
	// ^A0 - Font
	// ^FD - Field Data
	// ^BY - Barcode Width
	// ^BC - Barcode 128
	// ^XZ - End Format
	return fmt.Sprintf(`
^XA
^FO50,50^A0N,40,40^FD%s^FS
^FO50,100^A0N,25,25^FDSKU: %s^FS
^FO50,150^BY2
^BCN,100,Y,N,N
^FD%s^FS
^XZ
`, p.Name, p.Sku, p.Sku)
}

// GenerateTSPL creates a TSPL string for TSC-compatible printers
func (g *LabelGenerator) GenerateTSPL(p *ent.Product) string {
	return fmt.Sprintf(`
SIZE 4, 2
GAP 0, 0
DIRECTION 1
CLS
TEXT 50,50,"ROMAN.TTF",0,12,12,"%s"
BARCODE 50,100,"128",80,1,0,2,2,"%s"
PRINT 1,1
`, p.Name, p.Sku)
}
