package main

import (
	"context"
	"embed"
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

	"sent/ent"
	"sent/pkg/admin"
	"sent/pkg/auth"
	"sent/pkg/bridge"
	"sent/pkg/bridge/peripherals"
	"sent/pkg/capital"
	"sent/pkg/database"
	"sent/pkg/horizon"
	"sent/pkg/nexus"
	"sent/pkg/nexus/discovery"
	"sent/pkg/optic"
	"sent/pkg/orchestrator"
	"sent/pkg/pilot"
	"sent/pkg/pulse/agent"
	"sent/pkg/stock"

	"sent/pkg/tax"
	"sent/pkg/testsuite"
	"sent/pkg/vault"
	"sent/pkg/wave"

	"github.com/riverqueue/river"
)

//go:embed frontend/dist
var assets embed.FS

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

	validateCmd := &cobra.Command{
		Use:   "validate",
		Short: "Run Gold Master validation suite",
		Run:   runValidation,
	}

	seedCmd := &cobra.Command{
		Use:   "seed",
		Short: "Seed database with comprehensive fake data",
		Run:   runSeeding,
	}

	rootCmd.AddCommand(validateCmd)
	rootCmd.AddCommand(seedCmd)
	rootCmd.PersistentFlags().StringVar(&mode, "mode", "client", "Application mode: 'client' (GUI) or 'worker' (Headless)")
	rootCmd.PersistentFlags().StringVar(&service, "service", "", "Specific service to run in worker mode")

	if err := rootCmd.Execute(); err != nil {
		fmt.Printf("Error executing command: %v\n", err)
		os.Exit(1)
	}
}

func runValidation(cmd *cobra.Command, args []string) {
	dbClient := database.NewPostgresClient()
	defer dbClient.Close()

	testsuite.RunValidation(dbClient)
}

func runSeeding(cmd *cobra.Command, args []string) {
	dbClient := database.NewPostgresClient()
	defer dbClient.Close()

	seeder := testsuite.NewComprehensiveSeeder(dbClient)
	if err := seeder.SeedAll(); err != nil {
		log.Fatalf("Seeding failed: %v", err)
	}
}

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
		if err := dbClient.Close(); err != nil {
			fmt.Printf("[SENT] Error closing database: %v\n", err)
		}
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
//
// @param db - The database client.
// @param svc - The specific service identifier to run.
func runWorker(db *ent.Client, svc string) {
	fmt.Printf("[WORKER] Starting SENT worker. Service: %s\n", svc)
	
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// Setup signal handling for graceful shutdown of worker
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, os.Interrupt, syscall.SIGTERM)

	if svc == "optic" {
		worker := optic.NewOpticWorker(db)
		go func() {
			if err := worker.Run(ctx); err != nil {
				fmt.Printf("[OPTIC] Worker error: %v\n", err)
			}
		}()
	}

	if svc == "nexus" {
		worker := discovery.NewWorker(db)
		go func() {
			if err := worker.Run(ctx); err != nil {
				fmt.Printf("[NEXUS] Worker error: %v\n", err)
			}
		}()
	}
	
	// Block until signal is received
	<-sigChan
	cancel()
	fmt.Println("[WORKER] Shutdown signal received.")
}

// runClient starts the Wails GUI application.
//
// @param db - The database client.
func runClient(db *ent.Client) {
	// Initialize Central Orchestrator
	centralOrchestrator := orchestrator.NewOrchestrator(db)

	// Initialize Bridges with the live database connection
	systemBridge := bridge.NewSystemBridge()
	authBridge := auth.NewAuthBridge(db)
	capitalBridge := capital.NewCapitalBridge(db, authBridge)
	vaultBridge := vault.NewVaultBridge(db, authBridge)
	stockBridge := stock.NewStockBridge(db, authBridge)
	controlBridge := bridge.NewControlBridge(db, centralOrchestrator)
	securityAuditBridge := bridge.NewSecurityAuditBridge()
	kioskBridge := stock.NewKioskBridge(db, centralOrchestrator.GetClient(), securityAuditBridge, authBridge)
	adminBridge := admin.NewAdminBridge(db, authBridge)
	taxBridge := tax.NewTaxBridge(db, authBridge)
	pulseBridge := bridge.NewPulseBridge(db)
	
	// Set River Client for Vault and Pulse
	vaultBridge.SetRiverClient(centralOrchestrator.GetClient())
	pulseBridge.SetRiverClient(centralOrchestrator.GetClient())
	
	opticBridge := optic.NewOpticBridge(db, authBridge)
	pilotBridge := pilot.NewPilotBridge(db, authBridge)
	pilotBridge.SetRiverClient(centralOrchestrator.GetClient())
	nexusBridge := nexus.NewNexusBridge(db, authBridge)
	horizonBridge := horizon.NewHorizonBridge(db, authBridge, vaultBridge)
	waveBridge := wave.NewWaveBridge(db, authBridge)
	peripheralsBridge := peripherals.NewPeripheralsBridge(db)

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
			// Register Workers (KillSwitchWorker is already registered in control.RegisterStockHooks)
			river.AddWorker(centralOrchestrator.Workers(), vault.NewOCRWorker(db))
			river.AddWorker(centralOrchestrator.Workers(), stock.NewReservationReleaseWorker(db))

			centralOrchestrator.Start(ctx)
			systemBridge.Startup(ctx)
			authBridge.Startup(ctx)
			adminBridge.Startup(ctx)
			capitalBridge.Startup(ctx)
			vaultBridge.Startup(ctx)
			stockBridge.Startup(ctx)
			kioskBridge.Startup(ctx)
			taxBridge.Startup(ctx)
			pulseBridge.Startup(ctx)
			controlBridge.Startup(ctx)
			opticBridge.Startup(ctx)
			pilotBridge.Startup(ctx)
			nexusBridge.Startup(ctx)
			horizonBridge.Startup(ctx)
			waveBridge.Startup(ctx)
			peripheralsBridge.Startup(ctx)

			// Start background workers
			kioskSync := stock.NewKioskSyncWorker(db, kioskBridge)
			go kioskSync.Run(ctx)

			fifoWorker := stock.NewFIFOWorker(db)
			go fifoWorker.Run(ctx)

			opticStorage := optic.NewStorageManager(db)
			auditObserver := optic.NewAuditObserver(db, opticStorage)
			go auditObserver.Run(ctx)
		},
		OnBeforeClose: func(ctx context.Context) bool {
			// Return false to allow the application to close normally.
			// Cleanup logic is handled by the deferred db.Close() in runApp.
			return false 
		},
		Bind: []interface{}{
			systemBridge,
			authBridge,
			capitalBridge,
			vaultBridge,
			stockBridge,
			kioskBridge,
			adminBridge,
			taxBridge,
			pulseBridge,
			controlBridge,
			opticBridge,
			pilotBridge,
			nexusBridge,
			horizonBridge,
			waveBridge,
			peripheralsBridge,
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
