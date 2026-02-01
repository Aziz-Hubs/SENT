package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/spf13/cobra"
	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/options/linux"

	"sent/internal/app/wails_bridge"
	"sent/internal/app/wails_bridge/peripherals"
	"sent/internal/divisions/erp/capital"
	"sent/internal/divisions/erp/stock"
	"sent/internal/divisions/msp/pilot"
	"sent/internal/divisions/msp/pulse/agent"
	"sent/internal/platform/auth"
	"sent/internal/platform/database"
	"sent/internal/platform/orchestrator"
	"sent/web"

	"github.com/jackc/pgx/v5/pgxpool"

	// "sent/internal/platform/testsuite"

	"github.com/riverqueue/river"
)

// assets is now coming from web package
// var assets embed.FS

var (
	mode    string
	service string
)

// main is the entry point of the SENT application.
// It sets up the CLI commands and delegates execution based on the provided flags.
func main() {
	rootCmd := &cobra.Command{
		Use:   "sent",
		Short: "SENT - Unified Modular Monolith",
		Long:  `SENT is a modular monolith platform designed for enterprise resource planning, integrating finance, inventory, auth, and more.`,
		Run:   runApp,
	}

	// validateCmd := &cobra.Command{
	// 	Use:   "validate",
	// 	Short: "Run Gold Master validation suite",
	// 	Run:   runValidation,
	// }

	// seedCmd := &cobra.Command{
	// 	Use:   "seed",
	// 	Short: "Seed database with comprehensive fake data",
	// 	Run:   runSeeding,
	// }

	// rootCmd.AddCommand(validateCmd)
	// rootCmd.AddCommand(seedCmd)
	rootCmd.PersistentFlags().StringVar(&mode, "mode", "client", "Application mode: 'client' (GUI) or 'worker' (Headless)")
	rootCmd.PersistentFlags().StringVar(&service, "service", "", "Specific service to run in worker mode")

	if err := rootCmd.Execute(); err != nil {
		fmt.Printf("Error executing command: %v\n", err)
		os.Exit(1)
	}
}

// func runValidation(cmd *cobra.Command, args []string) {
// 	dbClient := database.NewPostgresClient()
// 	defer dbClient.Close()
//
// 	testsuite.RunValidation(dbClient)
// }

// func runSeeding(cmd *cobra.Command, args []string) {
// 	dbClient := database.NewPostgresClient()
// 	defer dbClient.Close()
//
// 	seeder := testsuite.NewComprehensiveSeeder(dbClient)
// 	if err := seeder.SeedAll(); err != nil {
// 		log.Fatalf("Seeding failed: %v", err)
// 	}
// }

// runApp initializes core dependencies and starts the application in the selected mode.
func runApp(cmd *cobra.Command, args []string) {
	if mode == "agent" {
		agent.Run()
		return
	}

	// For client and worker modes, we need the database
	dbClient := database.NewPostgresClient()
	defer func() {
		fmt.Println("[SENT] Closing database connection...")
		defer func() {
			fmt.Println("[SENT] Closing database connection...")
			dbClient.Close()
		}()
	}()

	// Register Orchestrator Hooks
	orchestrator.RegisterStockHooks(dbClient)

	if mode == "worker" {
		runWorker(dbClient, service)
		return
	}

	runClient(dbClient)
}

func runWorker(db *pgxpool.Pool, svc string) {
	fmt.Printf("[WORKER] Starting SENT worker. Service: %s\n", svc)

	_, cancel := context.WithCancel(context.Background())
	defer cancel()

	// Setup signal handling for graceful shutdown of worker
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, os.Interrupt, syscall.SIGTERM)

	// Block until signal is received
	<-sigChan
	cancel()
	fmt.Println("[WORKER] Shutdown signal received.")
}

// runClient starts the Wails GUI application.
//
// @param db - The database client.
func runClient(db *pgxpool.Pool) {
	// Initialize Central Orchestrator
	centralOrchestrator := orchestrator.NewOrchestrator(db)

	// Initialize Bridges with the live database connection
	authBridge := auth.NewAuthBridge(db)
	capitalBridge := capital.NewCapitalBridge(db, authBridge)
	stockBridge := stock.NewStockBridge(db, authBridge)
	kioskBridge := stock.NewKioskBridge(db, centralOrchestrator.GetClient(), nil, authBridge)
	pilotBridge := pilot.NewPilotBridge(db, authBridge)
	pilotBridge.SetRiverClient(centralOrchestrator.GetClient())
	peripheralsBridge := peripherals.NewPeripheralsBridge(db)
	pulseBridge := wails_bridge.NewPulseBridge(db)
	pulseBridge.SetRiverClient(centralOrchestrator.GetClient())
	peopleBridge := wails_bridge.NewPeopleBridge(db)

	// Configure and run the Wails application
	err := wails.Run(&options.App{
		Title:     "SENT",
		Width:     1280,
		Height:    800,
		MinWidth:  1024,
		MinHeight: 768,
		AssetServer: &assetserver.Options{
			Assets: web.Assets,
		},
		BackgroundColour: &options.RGBA{R: 15, G: 23, B: 42, A: 255}, // Matches slate-900 usually
		OnStartup: func(ctx context.Context) {
			// Register Workers
			river.AddWorker(centralOrchestrator.Workers(), stock.NewReservationReleaseWorker(db))

			centralOrchestrator.Start(ctx)
			authBridge.Startup(ctx)
			capitalBridge.Startup(ctx)
			stockBridge.Startup(ctx)
			kioskBridge.Startup(ctx)
			pilotBridge.Startup(ctx)
			peripheralsBridge.Startup(ctx)
			pulseBridge.Startup(ctx)
			peopleBridge.Startup(ctx)

			// Start background workers
			kioskSync := stock.NewKioskSyncWorker(db, kioskBridge)
			go kioskSync.Run(ctx)

			fifoWorker := stock.NewFIFOWorker(db)
			go fifoWorker.Run(ctx)
		},
		OnBeforeClose: func(ctx context.Context) bool {
			return false
		},
		Bind: []interface{}{
			authBridge,
			capitalBridge,
			stockBridge,
			kioskBridge,
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
