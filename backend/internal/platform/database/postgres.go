package database

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
	_ "github.com/jackc/pgx/v5/stdlib"
)

// NewPostgresClient initializes and returns a new pgx connection pool.
// It loads configuration from environment variables or uses defaults.
func NewPostgresClient() *pgxpool.Pool {
	// Load configuration
	host := getEnv("DB_HOST", "localhost")
	port := getEnv("DB_PORT", "5433")
	user := getEnv("DB_USER", "postgres")
	pass := getEnv("DB_PASS", "postgres")
	dbname := getEnv("DB_NAME", "sent")

	dsn := fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=disable",
		user, pass, host, port, dbname)

	config, err := pgxpool.ParseConfig(dsn)
	if err != nil {
		log.Fatalf("failed parsing dsn: %v", err)
	}

	// Basic pooling configuration
	config.MaxConns = 25
	config.MinConns = 5

	pool, err := pgxpool.NewWithConfig(context.Background(), config)
	if err != nil {
		log.Fatalf("failed creating connection pool: %v", err)
	}

	// Verify connection
	if err := pool.Ping(context.Background()); err != nil {
		log.Fatalf("failed pinging database: %v", err)
	}

	fmt.Println("[DB] Successfully connected to PostgreSQL via pgxpool")

	return pool
}

// getEnv retrieves an environment variable or returns a default value.
func getEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
}
