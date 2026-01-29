package pilot

import (
	"context"
	"fmt"
	"sent/ent"
	"sent/ent/remediationstep"
	"time"
)

// PlaybookEngine orchestrates multi-step remediation.
type PlaybookEngine struct {
	db *ent.Client
}

// TriggerPlaybook starts a chained sequence of actions.
func (e *PlaybookEngine) TriggerPlaybook(ctx context.Context, ticketID int, playbookName string) error {
	// 1. Define sequence (Mock for now)
	steps := []string{"Stop Service", "Clear Cache", "Restart Service"}
	
	for i, name := range steps {
		step, _ := e.db.RemediationStep.Create().
			SetTicketID(ticketID).
			SetActionName(name).
			SetSequence(i).
			SetStatus(remediationstep.StatusPending).
			Save(ctx)
		
		// Execute step synchronously for mock, in reality this would be async
		if err := e.executeStep(ctx, step); err != nil {
			return fmt.Errorf("playbook failed at step %s: %w", name, err)
		}
	}
	
	return nil
}

func (e *PlaybookEngine) executeStep(ctx context.Context, s *ent.RemediationStep) error {
	// Update to running
	e.db.RemediationStep.UpdateOne(s).SetStatus(remediationstep.StatusRunning).Exec(ctx)
	
	// Simulate SENTpulse agent call
	time.Sleep(1 * time.Second)
	
	success := true // Mock result
	
	status := remediationstep.StatusSuccess
	if !success {
		status = remediationstep.StatusFailed
	}

	err := e.db.RemediationStep.UpdateOne(s).
		SetStatus(status).
		SetOutput(fmt.Sprintf("Executed %s successfully", s.ActionName)).
		Exec(ctx)
	
	if !success {
		return fmt.Errorf("step execution failed")
	}
	return err
}
