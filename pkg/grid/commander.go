package grid

import (
	"context"
	"fmt"
	"sent/ent"
	"sent/ent/networkport"
	"sent/pkg/grid/pool"
)

// SwitchCommander provides direct control over network ports.
type SwitchCommander struct {
	db   *ent.Client
	pool *pool.WorkerPool
}

// NewSwitchCommander initializes a switch commander.
func NewSwitchCommander(db *ent.Client, pool *pool.WorkerPool) *SwitchCommander {
	return &SwitchCommander{
		db:   db,
		pool: pool,
	}
}

// SetVLAN reassigns a port to a different VLAN.
func (c *SwitchCommander) SetVLAN(ctx context.Context, portID int, vlan int) error {
	port, err := c.db.NetworkPort.Query().Where(networkport.ID(portID)).WithDevice().Only(ctx)
	if err != nil {
		return err
	}

	command := fmt.Sprintf("interface %s\n switchport access vlan %d", port.Name, vlan)
	
	resChan := make(chan pool.Result, 1)
	c.pool.Submit(pool.Task{
		DeviceIP: port.Edges.Device.IPAddress,
		Command:  command,
		Vendor:   port.Edges.Device.Vendor,
		Result:   resChan,
	})

	res := <-resChan
	if res.Error != nil {
		return res.Error
	}

	return c.db.NetworkPort.UpdateOne(port).SetVlan(vlan).Exec(ctx)
}

// QuarantinePort isolates a compromised device.
func (c *SwitchCommander) QuarantinePort(ctx context.Context, portID int) error {
	port, err := c.db.NetworkPort.Query().Where(networkport.ID(portID)).WithDevice().Only(ctx)
	if err != nil {
		return err
	}

	// Move to a restricted Quarantine VLAN (e.g., 666) or shut the port.
	command := fmt.Sprintf("interface %s\n shutdown", port.Name)
	
	resChan := make(chan pool.Result, 1)
	c.pool.Submit(pool.Task{
		DeviceIP: port.Edges.Device.IPAddress,
		Command:  command,
		Vendor:   port.Edges.Device.Vendor,
		Result:   resChan,
	})

	res := <-resChan
	if res.Error != nil {
		return res.Error
	}

	return c.db.NetworkPort.UpdateOne(port).SetStatus("shutdown").Exec(ctx)
}

// CyclePoE power cycles a PoE-enabled port.
func (c *SwitchCommander) CyclePoE(ctx context.Context, portID int) error {
	port, err := c.db.NetworkPort.Query().Where(networkport.ID(portID)).WithDevice().Only(ctx)
	if err != nil {
		return err
	}

	if !port.PoeEnabled {
		return fmt.Errorf("port is not PoE enabled")
	}

	command := fmt.Sprintf("interface %s\n power inline consumption 0\n no power inline consumption", port.Name)
	
	resChan := make(chan pool.Result, 1)
	c.pool.Submit(pool.Task{
		DeviceIP: port.Edges.Device.IPAddress,
		Command:  command,
		Vendor:   port.Edges.Device.Vendor,
		Result:   resChan,
	})

	res := <-resChan
	return res.Error
}
