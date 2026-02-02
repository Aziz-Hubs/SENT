package wails_bridge

import (
	"context"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/riverqueue/river"
)

type PulseBridge struct {
	db          *pgxpool.Pool
	riverClient *river.Client[pgx.Tx]
}

func NewPulseBridge(db *pgxpool.Pool) *PulseBridge {
	return &PulseBridge{
		db: db,
	}
}

func (p *PulseBridge) SetRiverClient(client *river.Client[pgx.Tx]) {
	p.riverClient = client
}

func (p *PulseBridge) Startup(ctx context.Context) {
	// TODO: Implement startup logic
}

type PeopleBridge struct {
	db *pgxpool.Pool
}

func NewPeopleBridge(db *pgxpool.Pool) *PeopleBridge {
	return &PeopleBridge{
		db: db,
	}
}

func (p *PeopleBridge) Startup(ctx context.Context) {
	// TODO: Implement startup logic
}
