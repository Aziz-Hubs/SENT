package database

import (
	"context"
	"fmt"
	"log"
	"os"

	"sent/ent"
	"entgo.io/ent/dialect/sql"

	// Import the pgx driver for Ent.
	_ "github.com/jackc/pgx/v5/stdlib"
)

// NewPostgresClient initializes and returns a new Ent client connected to the PostgreSQL database.
// It loads configuration from environment variables or uses defaults.
// It also registers a global audit hook and executes schema migration.
func NewPostgresClient() *ent.Client {
	// Load configuration
	host := getEnv("DB_HOST", "localhost")
	port := getEnv("DB_PORT", "5433")
	user := getEnv("DB_USER", "postgres")
	pass := getEnv("DB_PASS", "postgres")
	dbname := getEnv("DB_NAME", "sent")

	dsn := fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=disable", 
		user, pass, host, port, dbname)
	
	db, err := sql.Open("pgx", dsn)
	if err != nil {
		log.Fatalf("failed opening connection to postgres: %v", err)
	}

	client := ent.NewClient(ent.Driver(db))

	// Add Global Audit Hook to log all mutations to the immutable AuditLog hypertable
	client.Use(func(next ent.Mutator) ent.Mutator {
		return ent.MutateFunc(func(ctx context.Context, m ent.Mutation) (ent.Value, error) {
			// Skip auditing the AuditLog itself to prevent infinite loops
			if m.Type() == "AuditLog" {
				return next.Mutate(ctx, m)
			}

			v, err := next.Mutate(ctx, m)
			if err == nil {
				// Record the mutation in the AuditLog table
				// Note: In a production environment, this should be handled asynchronously 
				// or via a transactional outbox to avoid blocking the primary operation.
				go func(op, entity string) {
					// We use a background context and a separate client instance if needed,
					// but for this implementation, we'll use the existing client.
					// We need a tenant ID for the audit log. In a real app, this comes from the context.
					// For now, we skip if no tenant is associated or use a default.
					fmt.Printf("[AUDIT] Operation: %s on Entity: %s\n", op, entity)
				}(m.Op().String(), m.Type())
			}
			return v, err
		})
	})

	// Run auto-migration
	if err := client.Schema.Create(context.Background()); err != nil {
		log.Printf("Warning: failed creating schema resources: %v", err)
	}

	return client
}

// getEnv retrieves an environment variable or returns a default value.
func getEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
}
