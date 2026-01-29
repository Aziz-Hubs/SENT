package discovery

import (
	"context"
	"fmt"
	"sent/ent"
	"sent/ent/networkdevice"
	"sent/ent/networkport"
	"sent/pkg/grid/pool"
	"sent/pkg/grid"
	"time"
)

// Crawler orchestrates the recursive discovery of network topology.
type Crawler struct {
	db      *ent.Client
	pool    *pool.WorkerPool
	parser  *grid.TemplateParser
	visited map[string]bool
}

// NewCrawler initializes a topology crawler.
func NewCrawler(db *ent.Client, pool *pool.WorkerPool, parser *grid.TemplateParser) *Crawler {
	return &Crawler{
		db:      db,
		pool:    pool,
		parser:  parser,
		visited: make(map[string]bool),
	}
}

// Discover starts crawling from a seed device.
func (c *Crawler) Discover(ctx context.Context, seedIP string) error {
	if c.visited[seedIP] {
		return nil
	}
	c.visited[seedIP] = true

	fmt.Printf("[GRID] Crawling device: %s\n", seedIP)

	// 1. Fetch LLDP neighbors
	resChan := make(chan pool.Result, 1)
	c.pool.Submit(pool.Task{
		DeviceIP: seedIP,
		Command:  "show lldp neighbors", // Generic command, real implementation would be vendor specific
		Vendor:   "cisco",
		Result:   resChan,
	})

	res := <-resChan
	if res.Error != nil {
		return res.Error
	}

	// 2. Normalize output
	neighbors, err := c.parser.Parse("cisco_ios_show_version", res.Output)
	if err != nil {
		return err
	}

	// 3. Update DB and Recurse
	for _, n := range neighbors {
		neighborIP := fmt.Sprintf("%v", n["neighbor_ip"])
		localPort := fmt.Sprintf("%v", n["local_port"])
		remotePort := fmt.Sprintf("%v", n["remote_port"])

		if neighborIP == "" {
			continue
		}

		// Ensure ports and device exist in DB
		err := c.updateNexus(ctx, seedIP, localPort, neighborIP, remotePort)
		if err != nil {
			fmt.Printf("[GRID] Nexus update failed: %v\n", err)
			continue
		}

		// Recurse
		go c.Discover(ctx, neighborIP)
	}

	return nil
}

func (c *Crawler) updateNexus(ctx context.Context, sIP, sPort, tIP, tPort string) error {
	tx, err := c.db.Tx(ctx)
	if err != nil {
		return err
	}
	defer func() {
		if v := recover(); v != nil {
			tx.Rollback()
			panic(v)
		}
	}()

	// 1. Ensure Source Device & Port
	sDev, _ := tx.NetworkDevice.Query().Where(networkdevice.IPAddress(sIP)).Only(ctx)
	if sDev == nil {
		sDev, _ = tx.NetworkDevice.Create().SetName(sIP).SetIPAddress(sIP).SetStatus("ONLINE").Save(ctx)
	}
	
	sp, _ := tx.NetworkPort.Query().Where(networkport.HasDeviceWith(networkdevice.ID(sDev.ID)), networkport.Name(sPort)).Only(ctx)
	if sp == nil {
		sp, _ = tx.NetworkPort.Create().SetName(sPort).SetDevice(sDev).Save(ctx)
	}

	// 2. Ensure Target Device & Port
	tDev, _ := tx.NetworkDevice.Query().Where(networkdevice.IPAddress(tIP)).Only(ctx)
	if tDev == nil {
		tDev, _ = tx.NetworkDevice.Create().SetName(tIP).SetIPAddress(tIP).SetStatus("ONLINE").Save(ctx)
	}

	tp, _ := tx.NetworkPort.Query().Where(networkport.HasDeviceWith(networkdevice.ID(tDev.ID)), networkport.Name(tPort)).Only(ctx)
	if tp == nil {
		tp, _ = tx.NetworkPort.Create().SetName(tPort).SetDevice(tDev).Save(ctx)
	}

	// 3. Create/Update Link
	err = tx.NetworkLink.Create().
		SetSourcePort(sp).
		SetTargetPort(tp).
		SetLastSeen(time.Now()).
		Exec(ctx)
	
	if err != nil {
		tx.Rollback()
		return err
	}

	return tx.Commit()
}
