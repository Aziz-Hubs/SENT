package main

import (
	"context"
	"log"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
)

func main() {
	_ = godotenv.Load()

	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		dbURL = "postgres://postgres:postgres@localhost:5433/postgres?sslmode=disable"
	}

	ctx := context.Background()
	db, err := pgxpool.New(ctx, dbURL)
	if err != nil {
		log.Fatalf("Unable to connect to database: %v", err)
	}
	defer db.Close()

	log.Println("Clearing SENTpulse data tables...")

	tables := []string{
		"script_executions",
		"alerts",
		"devices",
		"scripts",
	}

	for _, table := range tables {
		_, err := db.Exec(ctx, "DELETE FROM "+table)
		if err != nil {
			log.Printf("Failed to clear table %s: %v", table, err)
		} else {
			log.Printf("Cleared table: %s", table)
		}
	}

	log.Println("Database cleanup complete.")
}
