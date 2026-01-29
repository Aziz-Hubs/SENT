package control

import (
	"sent/ent"
	"sent/pkg/orchestrator"

	"github.com/riverqueue/river"
)

type ControlOrchestrator struct {
	db           *ent.Client
	central      *orchestrator.Orchestrator
}

func NewControlOrchestrator(db *ent.Client, central *orchestrator.Orchestrator) *ControlOrchestrator {
	// Register control-specific workers
	river.AddWorker(central.Workers(), &KillSwitchWorker{})
	
	return &ControlOrchestrator{
		db:      db,
		central: central,
	}
}

func (o *ControlOrchestrator) GetClient() any {
	return o.central.GetClient()
}

