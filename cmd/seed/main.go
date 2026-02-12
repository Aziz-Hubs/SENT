package main

import (
	"context"
	"log"
	"os"
	"path/filepath"

	"github.com/jackc/pgx/v5/pgxpool"
)

func main() {
	// 1. Connection
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

	// 2. Run Migrations (Simple Reader)
	log.Println("Applying migrations...")
	files := []string{
		"db/migrations/tenant/001_init_foundation.sql",
		"db/migrations/tenant/002_organizations.up.sql",
		"db/migrations/tenant/001_sentpulse.up.sql",
	}

	for _, file := range files {
		content, err := os.ReadFile(file)
		if err != nil {
			log.Fatalf("Failed to read migration %s: %v", file, err)
		}
		// Execute SQL
		_, err = db.Exec(ctx, string(content))
		if err != nil {
			log.Printf("Warning executing migration %s: %v (might already exist)", file, err)
			// We continue, assuming idempotency (IF NOT EXISTS)
		} else {
			log.Printf("Applied migration: %s", filepath.Base(file))
		}
	}

	log.Println("Seeding SENTpulse data...")

	// 3. Ensure an organization exists
	var orgID string
	err = db.QueryRow(ctx, `
		INSERT INTO organizations (name, slug) 
		VALUES ('Default Org', 'default-org') 
		ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name 
		RETURNING id`).Scan(&orgID)
	if err != nil {
		// Fallback
		err = db.QueryRow(ctx, "SELECT id FROM organizations WHERE slug = 'default-org'").Scan(&orgID)
		if err != nil {
			log.Fatalf("Failed to get/create organization: %v", err)
		}
	}
	log.Printf("Using Organization ID: %s", orgID)

	// 4. Ensure a User Exists
	var userID string
	err = db.QueryRow(ctx, `
		INSERT INTO users (organization_id, email, full_name)
		VALUES ($1, 'admin@sent.local', 'System Admin')
		ON CONFLICT (email) DO UPDATE SET full_name = EXCLUDED.full_name
		RETURNING id`, orgID).Scan(&userID)
	if err != nil {
		err = db.QueryRow(ctx, "SELECT id FROM users WHERE email='admin@sent.local'").Scan(&userID)
		if err != nil {
			log.Printf("Warning: failed to create mock user: %v", err)
		}
	}
	log.Printf("Using User ID: %s", userID)

	// 5. Insert Devices
	deviceIDs := []string{}
	devices := []struct {
		Name   string
		Type   string
		Status string
		OS     string
		IP     string
	}{
		{"HQ-Server-01", "server", "online", "windows", "10.0.1.5"},
		{"HQ-Firewall", "network", "online", "linux", "10.0.1.1"},
		{"Workstation-J", "workstation", "online", "windows", "10.0.2.50"},
		{"Workstation-K", "workstation", "offline", "macos", "10.0.2.51"},
		{"Backup-NAS", "server", "warning", "linux", "10.0.1.200"},
	}

	for _, d := range devices {
		var id string
		err := db.QueryRow(ctx, `
			INSERT INTO devices (organization_id, name, type, status, os, ip, last_seen)
			VALUES ($1, $2, $3, $4, $5, $6, NOW())
			RETURNING id`,
			orgID, d.Name, d.Type, d.Status, d.OS, d.IP).Scan(&id)
		if err != nil {
			log.Printf("Failed to insert device %s: %v", d.Name, err)
			continue
		}
		deviceIDs = append(deviceIDs, id)
		log.Printf("Inserted Device: %s (%s)", d.Name, id)
	}

	// 6. Insert Alerts
	if len(deviceIDs) > 0 {
		alerts := []struct {
			DeviceIdx   int
			Severity    string
			Title       string
			Description string
		}{
			{4, "warning", "High Disk Usage", "Volume /backup is at 92% capacity"},
			{3, "critical", "Device Offline", "Device Workstation-K has been offline for > 5 minutes"},
		}

		for _, a := range alerts {
			if a.DeviceIdx < len(deviceIDs) {
				_, err := db.Exec(ctx, `
					INSERT INTO alerts (organization_id, device_id, device_name, severity, title, description, created_at)
					VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
					orgID, deviceIDs[a.DeviceIdx], devices[a.DeviceIdx].Name, a.Severity, a.Title, a.Description)
				if err != nil {
					log.Printf("Failed to insert alert: %v", err)
				} else {
					log.Printf("Inserted Alert: %s (Device: %s)", a.Title, devices[a.DeviceIdx].Name)
				}
			}
		}
	}

	// 7. Insert Scripts
	_, err = db.Exec(ctx, `
		INSERT INTO scripts (organization_id, name, description, language, content, created_by)
		VALUES 
		($1, 'System Cleanup', 'Removes temp files', 'powershell', 'Remove-Item $env:TEMP\* -Recurse -Force', $2),
		($1, 'Check Disk Health', 'Checks SMART status', 'bash', 'smartctl -a /dev/sda', $2)
	`, orgID, userID)
	if err != nil {
		log.Printf("Warning: Failed to insert scripts: %v", err)
	} else {
		log.Println("Inserted mock scripts")
	}

	log.Println("Seeding complete!")
}
