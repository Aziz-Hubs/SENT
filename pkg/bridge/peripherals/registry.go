package peripherals

import (
	"fmt"
	"sync"
)

type DeviceType string

const (
	DeviceTypePrinter DeviceType = "printer"
	DeviceTypeScale   DeviceType = "scale"
)

type DeviceInfo struct {
	ID   string     `json:"id"`
	Name string     `json:"name"`
	Type DeviceType `json:"type"`
	Port string     `json:"port"` // /dev/ttyUSB0 or COM1
}

type Printer interface {
	Print(data []byte) error
	GetStatus() (string, error)
}

type Scale interface {
	ReadWeight() (float64, error)
	Zero() error
}

type Registry struct {
	mu      sync.RWMutex
	devices map[string]DeviceInfo
	printers map[string]Printer
	scales   map[string]Scale
}

func NewRegistry() *Registry {
	return &Registry{
		devices:  make(map[string]DeviceInfo),
		printers: make(map[string]Printer),
		scales:   make(map[string]Scale),
	}
}

func (r *Registry) RegisterPrinter(info DeviceInfo, p Printer) {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.devices[info.ID] = info
	r.printers[info.ID] = p
}

func (r *Registry) RegisterScale(info DeviceInfo, s Scale) {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.devices[info.ID] = info
	r.scales[info.ID] = s
}

func (r *Registry) GetPrinter(id string) (Printer, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	p, ok := r.printers[id]
	if !ok {
		return nil, fmt.Errorf("printer %s not found", id)
	}
	return p, nil
}

func (r *Registry) ListDevices() []DeviceInfo {
	r.mu.RLock()
	defer r.mu.RUnlock()
	list := make([]DeviceInfo, 0, len(r.devices))
	for _, d := range r.devices {
		list = append(list, d)
	}
	return list
}
