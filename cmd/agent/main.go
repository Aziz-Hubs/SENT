package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"

	"sent-platform/internal/agent/core"

	"github.com/joho/godotenv"
)

func main() {
	// Load .env if present (useful for local dev)
	_ = godotenv.Load()

	backendURL := os.Getenv("BACKEND_URL")
	if backendURL == "" {
		backendURL = "http://localhost:8081"
	}

	// Default Org ID for dev - using the one from DB we found earlier or env var
	orgID := os.Getenv("ORGANIZATION_ID")
	if orgID == "" {
		log.Println("ORGANIZATION_ID not set, using hardcoded default for dev (update this!)")
		// Fallback to the ID we found earlier: 42318d05-0d38-4fc7-9163-4ba8565d68f0
		orgID = "42318d05-0d38-4fc7-9163-4ba8565d68f0"
	}

	agent := core.NewAgent(core.Config{
		BackendURL:     backendURL,
		OrganizationID: orgID,
	})

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// Handle shutdown signals
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		<-sigChan
		log.Println("Shutting down agent...")
		cancel()
	}()

	if err := agent.Start(ctx); err != nil {
		log.Fatalf("Agent error: %v", err)
	}
}
