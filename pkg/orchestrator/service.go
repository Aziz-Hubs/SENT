package orchestrator

import (
	"context"
	"log"
	"sent/ent"
	"sent/pkg/capital"
	"sent/pkg/tax"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/riverqueue/river"
	"github.com/riverqueue/river/riverdriver/riverpgxv5"
)

type Orchestrator struct {

	db          *ent.Client
	pool        *pgxpool.Pool
	riverClient *river.Client[pgx.Tx]
	registry    *river.Workers
}

func NewOrchestrator(db *ent.Client) *Orchestrator {
	dsn := "postgres://postgres:postgres@localhost:5433/sent?sslmode=disable"
	
	pool, err := pgxpool.New(context.Background(), dsn)
	if err != nil {
		log.Fatalf("failed to create pgxpool: %v", err)
	}

	workers := river.NewWorkers()

	// Register Core Workers
	river.AddWorker(workers, capital.NewRecurringInvoiceWorker(db))
	river.AddWorker(workers, tax.NewTaxSubmissionWorker(db))
	
	// Register Orchestrator-specific workers
	river.AddWorker(workers, &TerminationWorker{db: db})
	river.AddWorker(workers, &RevokeSaaSWorker{db: db})
	river.AddWorker(workers, &AssetCleanupWorker{db: db})
	river.AddWorker(workers, &IncidentResponseWorker{db: db})
	river.AddWorker(workers, &CallRedirectionWorker{db: db})
	river.AddWorker(workers, &HealthUpdateWorker{db: db})

	riverClient, err := river.NewClient(riverpgxv5.New(pool), &river.Config{
		Workers: workers,
	})
	if err != nil {
		log.Printf("Warning: Failed to create River client: %v", err)
	}

	return &Orchestrator{
		db:          db,
		pool:        pool,
		riverClient: riverClient,
		registry:    workers,
	}
}

func (o *Orchestrator) Workers() *river.Workers {
	return o.registry
}

func (o *Orchestrator) GetClient() *river.Client[pgx.Tx] {	return o.riverClient
}

func (o *Orchestrator) Start(ctx context.Context) error {
	if o.riverClient != nil {
		return o.riverClient.Start(ctx)
	}
	return nil
}

func (o *Orchestrator) Stop(ctx context.Context) error {
	if o.riverClient != nil {
		return o.riverClient.Stop(ctx)
	}
	if o.pool != nil {
		o.pool.Close()
	}
	return nil
}
