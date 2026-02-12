package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
)

func main() {
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		dbURL = "postgres://postgres:postgres@localhost:5433/postgres?sslmode=disable"
	}

	dbPool, err := pgxpool.New(context.Background(), dbURL)
	if err != nil {
		log.Fatalf("Unable to connect to database: %v", err)
	}
	defer dbPool.Close()

	var id string
	err = dbPool.QueryRow(context.Background(), "SELECT id FROM organizations LIMIT 1").Scan(&id)
	if err != nil {
		// If no organizations, create one
		fmt.Println("No organizations found, creating one...")
		id = "00000000-0000-0000-0000-000000000001"
		_, err = dbPool.Exec(context.Background(), "INSERT INTO organizations (id, name) VALUES ($1, 'Test Org')", id)
		if err != nil {
			log.Fatalf("Failed to create org: %v", err)
		}
	}
	fmt.Printf("ORGANIZATION_ID=%s\n", id)
}
