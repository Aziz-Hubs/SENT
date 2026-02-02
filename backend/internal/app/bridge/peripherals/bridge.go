package peripherals

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
)

type PeripheralsBridge struct {
	db *pgxpool.Pool
}

func NewPeripheralsBridge(db *pgxpool.Pool) *PeripheralsBridge {
	return &PeripheralsBridge{
		db: db,
	}
}

func (p *PeripheralsBridge) Startup(ctx context.Context) {
	// TODO: Implement startup logic
}
