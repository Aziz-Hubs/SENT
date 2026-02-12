package main

import (
	"context"
	"log"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		dbURL = "postgres://postgres:postgres@localhost:5433/postgres?sslmode=disable"
	}

	dbPool, err := pgxpool.New(context.Background(), dbURL)
	if err != nil {
		log.Fatalf("Unable to connect to database: %v", err)
	}
	defer dbPool.Close()

	sql := `
	-- Script Executions updates
	ALTER TABLE script_executions 
	ADD COLUMN IF NOT EXISTS adhoc_command TEXT,
	ADD COLUMN IF NOT EXISTS adhoc_language VARCHAR(20),
	ALTER COLUMN executed_by TYPE TEXT;

	-- Devices updates for detailed inventory
	ALTER TABLE devices
	ADD COLUMN IF NOT EXISTS local_ip TEXT,
	ADD COLUMN IF NOT EXISTS mac_address TEXT,
	ADD COLUMN IF NOT EXISTS boot_time TIMESTAMP,
	ADD COLUMN IF NOT EXISTS "current_user" TEXT,
	ADD COLUMN IF NOT EXISTS os_info JSONB,
	ADD COLUMN IF NOT EXISTS hardware JSONB,
	ADD COLUMN IF NOT EXISTS network_interfaces JSONB,
	ADD COLUMN IF NOT EXISTS storage_drives JSONB,
	ADD COLUMN IF NOT EXISTS installed_software JSONB,
	ADD COLUMN IF NOT EXISTS processes JSONB,
	ADD COLUMN IF NOT EXISTS patches JSONB,
	ADD COLUMN IF NOT EXISTS services JSONB,
	ADD COLUMN IF NOT EXISTS security JSONB,
	ADD COLUMN IF NOT EXISTS audit_log JSONB;
	`

	log.Println("Applying migration: Add adhoc_command columns...")
	_, err = dbPool.Exec(context.Background(), sql)
	if err != nil {
		log.Fatalf("Migration failed: %v", err)
	}
	log.Println("Migration successful!")
}
