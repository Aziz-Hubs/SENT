package peripherals

import (
	"context"
	"fmt"
	"sent/ent"
	"sent/pkg/stock"
)

type PeripheralsBridge struct {
	ctx            context.Context
	db             *ent.Client
	registry       *Registry
	labelGenerator *stock.LabelGenerator
}

func NewPeripheralsBridge(db *ent.Client) *PeripheralsBridge {
	return &PeripheralsBridge{
		db:             db,
		registry:       NewRegistry(),
		labelGenerator: stock.NewLabelGenerator(),
	}
}

func (b *PeripheralsBridge) Startup(ctx context.Context) {
	b.ctx = ctx
	// Register a mock printer for industrialization testing
	b.registry.RegisterPrinter(DeviceInfo{
		ID:   "label-01",
		Name: "Warehouse Zebra ZT411",
		Type: DeviceTypePrinter,
		Port: "/dev/ttyUSB0",
	}, &MockSerialPrinter{Port: "/dev/ttyUSB0"})
}

func (b *PeripheralsBridge) ListDevices() []DeviceInfo {
	return b.registry.ListDevices()
}

func (b *PeripheralsBridge) PrintProductLabel(productID int, printerID string) error {
	p, err := b.db.Product.Get(b.ctx, productID)
	if err != nil {
		return err
	}

	printer, err := b.registry.GetPrinter(printerID)
	if err != nil {
		return err
	}

	zpl := b.labelGenerator.GenerateZPL(p)
	fmt.Printf("[PERIPHERALS] Sending ZPL to %s:\n%s\n", printerID, zpl)
	
	return printer.Print([]byte(zpl))
}

// MockSerialPrinter simulates a serial connection to an industrial printer
type MockSerialPrinter struct {
	Port string
}

func (m *MockSerialPrinter) Print(data []byte) error {
	fmt.Printf("[HARDWARE] Writing %d bytes to %s\n", len(data), m.Port)
	// In a real implementation, we would use a library like 'tarm/serial'
	return nil
}

func (m *MockSerialPrinter) GetStatus() (string, error) {
	return "Online", nil
}
