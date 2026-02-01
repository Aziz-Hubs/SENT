package app

import (
	"context"
	"embed"
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/riverqueue/river"
	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/options/linux"

	// App & Platform Imports

	"sent/internal/app/wails_bridge"
	"sent/internal/app/wails_bridge/peripherals"
	"sent/internal/platform/auth"
	"sent/internal/platform/database"
	"sent/internal/platform/orchestrator"

	// MSP Division Imports
	"sent/internal/divisions/msp/pilot"
	"sent/internal/divisions/msp/pulse/agent"

	// Assuming bridge logic is here or in wails_bridge?
	// ERP Division Imports

	"sent/internal/divisions/erp/capital"
	"sent/internal/divisions/erp/stock"
)

//go:embed frontend/dist
var assets embed.FS

// Run initializes core dependencies and starts the application in the selected mode.
func Run(mode, service string) {
	if mode == "agent" {
		agent.Run()
		return
	}

	// For client and worker modes, we need the database
	dbClient := database.NewPostgresClient()
	defer func() {
		fmt.Println("[SENT] Closing database connection...")
		dbClient.Close()
	}()

	// Register Orchestrator Hooks
	orchestrator.RegisterStockHooks(dbClient)

	if mode == "worker" {
		runWorker(dbClient, service)
		return
	}

	runClient(dbClient)
}

// runWorker starts the application in headless mode for background tasks.
func runWorker(pool *pgxpool.Pool, svc string) {
	fmt.Printf("[WORKER] Starting SENT worker. Service: %s\n", svc)

	_, cancel := context.WithCancel(context.Background())
	defer cancel()

	// Setup signal handling for graceful shutdown of worker
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, os.Interrupt, syscall.SIGTERM)

	// Block until signal is received
	<-sigChan

	// Block until signal is received
	<-sigChan
	cancel()
	fmt.Println("[WORKER] Shutdown signal received.")
}

// runClient starts the Wails GUI application.
func runClient(pool *pgxpool.Pool) {
	// Initialize bridges and other components
	// Note: authBridge, kioskBridge, etc. should be defined or passed
	// For this refactor, we focus on the ones we updated.

	// Assuming authBridge and others are initialized similarly
	authBridge := auth.NewAuthBridge(pool)
	capitalBridge := capital.NewCapitalBridge(pool, authBridge)
	stockBridge := stock.NewStockBridge(pool, authBridge)

	// Initialize Central Orchestrator
	centralOrchestrator := orchestrator.NewOrchestrator(pool)

	// Initialize Bridges with the live database connection
	pulseBridge := wails_bridge.NewPulseBridge(pool)
	pulseBridge.SetRiverClient(centralOrchestrator.GetClient())

	pilotBridge := pilot.NewPilotBridge(pool, authBridge)
	pilotBridge.SetRiverClient(centralOrchestrator.GetClient())

	peripheralsBridge := peripherals.NewPeripheralsBridge(pool)

	// PeopleBridge refactored earlier
	peopleBridge := wails_bridge.NewPeopleBridge(pool)

	// Configure and run the Wails application
	err := wails.Run(&options.App{
		Title:     "SENT",
		Width:     1280,
		Height:    800,
		MinWidth:  1024,
		MinHeight: 768,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 15, G: 23, B: 42, A: 255}, // Matches slate-900 usually
		OnStartup: func(ctx context.Context) {
			// Register Workers
			river.AddWorker(centralOrchestrator.Workers(), stock.NewReservationReleaseWorker(pool))

			centralOrchestrator.Start(ctx)
			authBridge.Startup(ctx)
			pulseBridge.Startup(ctx)
			pilotBridge.Startup(ctx)
			peripheralsBridge.Startup(ctx)
			peopleBridge.Startup(ctx)

			// Start background workers
			kioskSync := stock.NewKioskSyncWorker(pool, nil) // Mock kioskBridge
			go kioskSync.Run(ctx)

			fifoWorker := stock.NewFIFOWorker(pool)
			go fifoWorker.Run(ctx)
		},
		OnBeforeClose: func(ctx context.Context) bool {
			// Return false to allow the application to close normally.
			// Cleanup logic is handled by the deferred db.Close() in runApp.
			return false
		},
		Bind: []interface{}{
			authBridge,
			capitalBridge,
			stockBridge,
			pilotBridge,
			peripheralsBridge,
			pulseBridge,
			peopleBridge,
		},
		Linux: &linux.Options{
			WindowIsTranslucent: false,
			WebviewGpuPolicy:    linux.WebviewGpuPolicyAlways,
		},
	})

	if err != nil {
		log.Fatal("Error during application run: " + err.Error())
	}
}
