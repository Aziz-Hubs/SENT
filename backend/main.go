package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/spf13/cobra"
	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/options/linux"

	"sent/internal/app/rpc"
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
	"github.com/riverqueue/river"
)

var (
	mode    string
	service string
	port    int
)

func main() {
	rootCmd := &cobra.Command{
		Use:   "sent",
		Short: "SENT - Unified Modular Monolith",
		Run:   runApp,
	}

	rootCmd.PersistentFlags().StringVar(&mode, "mode", "client", "Application mode: 'client' (GUI), 'worker' (Headless), or 'server' (Web)")
	rootCmd.PersistentFlags().StringVar(&service, "service", "", "Specific service to run in worker mode")
	rootCmd.PersistentFlags().IntVar(&port, "port", 8080, "Port to run the web server on (mode=server only)")

	if err := rootCmd.Execute(); err != nil {
		fmt.Printf("Error executing command: %v\n", err)
		os.Exit(1)
	}
}

func runApp(cmd *cobra.Command, args []string) {
	if mode == "agent" {
		agent.Run()
		return
	}

	dbClient := database.NewPostgresClient()
	defer dbClient.Close()

	orchestrator.RegisterStockHooks(dbClient)

	switch mode {
	case "worker":
		runWorker(dbClient, service)
	case "server":
		runServer(dbClient)
	default:
		runClient(dbClient)
	}
}

// initBridges is a helper to share bridge initialization between Wails and HTTP
func initBridges(db *pgxpool.Pool, orchestrator *orchestrator.Orchestrator) (
	*auth.AuthBridge,
	*capital.CapitalBridge,
	*stock.StockBridge,
	*stock.KioskBridge,
	*pilot.PilotBridge,
	*peripherals.PeripheralsBridge,
	*wails_bridge.PulseBridge,
	*wails_bridge.PeopleBridge,
) {
	authBridge := auth.NewAuthBridge(db)
	capitalBridge := capital.NewCapitalBridge(db, authBridge)
	stockBridge := stock.NewStockBridge(db, authBridge)
	kioskBridge := stock.NewKioskBridge(db, orchestrator.GetClient(), nil, authBridge)
	pilotBridge := pilot.NewPilotBridge(db, authBridge)
	pilotBridge.SetRiverClient(orchestrator.GetClient())
	peripheralsBridge := peripherals.NewPeripheralsBridge(db)
	pulseBridge := wails_bridge.NewPulseBridge(db)
	pulseBridge.SetRiverClient(orchestrator.GetClient())
	peopleBridge := wails_bridge.NewPeopleBridge(db)

	return authBridge, capitalBridge, stockBridge, kioskBridge, pilotBridge, peripheralsBridge, pulseBridge, peopleBridge
}

func runServer(db *pgxpool.Pool) {
	fmt.Printf("[SERVER] Starting SENT Web Server on port %d...\n", port)
	
	centralOrchestrator := orchestrator.NewOrchestrator(db)
	authB, capB, stockB, kioskB, pilotB, periB, pulseB, peopleB := initBridges(db, centralOrchestrator)

	// Setup RPC Dispatcher
	rpcHandler := rpc.NewRpcHandler()
	rpcHandler.Register("auth", "AuthBridge", authB)
	rpcHandler.Register("capital", "CapitalBridge", capB)
	rpcHandler.Register("stock", "StockBridge", stockB)
	rpcHandler.Register("stock", "KioskBridge", kioskB)
	rpcHandler.Register("pilot", "PilotBridge", pilotB)
	rpcHandler.Register("peripherals", "PeripheralsBridge", periB)
	rpcHandler.Register("wails_bridge", "PulseBridge", pulseB)
	rpcHandler.Register("wails_bridge", "PeopleBridge", peopleB)

	// Setup Echo
	e := echo.New()
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.CORS())

	// RPC Endpoint
	e.POST("/api/rpc", echo.WrapHandler(rpcHandler))

	// Serve Frontend
	e.StaticFS("/", echo.MustSubFS(web.Assets, "dist"))

	// Start everything
	ctx := context.Background()
	centralOrchestrator.Start(ctx)
	authB.Startup(ctx)
	
	go func() {
		if err := e.Start(fmt.Sprintf(":%d", port)); err != nil && err != http.ErrServerClosed {
			log.Fatal("Shutting down the server")
		}
	}()

	// Graceful Shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt, syscall.SIGTERM)
	<-quit
	fmt.Println("[SERVER] Shutting down...")
}

func runClient(db *pgxpool.Pool) {
	centralOrchestrator := orchestrator.NewOrchestrator(db)
	authB, capB, stockB, kioskB, pilotB, periB, pulseB, peopleB := initBridges(db, centralOrchestrator)

	err := wails.Run(&options.App{
		Title: "SENT", Width: 1280, Height: 800,
		AssetServer: &assetserver.Options{Assets: web.Assets},
		OnStartup: func(ctx context.Context) {
			centralOrchestrator.Start(ctx)
			authB.Startup(ctx)
			// ... other startups
		},
		Bind: []interface{}{authB, capB, stockB, kioskB, pilotB, periB, pulseB, peopleB},
	})
	if err != nil {
		log.Fatal(err)
	}
}

func runWorker(db *pgxpool.Pool, svc string) {
	fmt.Printf("[WORKER] Starting SENT worker. Service: %s\n", svc)
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, os.Interrupt, syscall.SIGTERM)
	<-sigChan
	fmt.Println("[WORKER] Shutdown signal received.")
}
