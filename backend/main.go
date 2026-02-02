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

	"github.com/jackc/pgx/v5/pgxpool"
)

var (
	port int
)

func main() {
	rootCmd := &cobra.Command{
		Use:   "sent",
		Short: "SENT - Unified Web API",
		Run:   runApp,
	}

	rootCmd.PersistentFlags().IntVar(&port, "port", 8080, "Port to run the API server on")

	if err := rootCmd.Execute(); err != nil {
		fmt.Printf("Error executing command: %v\n", err)
		os.Exit(1)
	}
}

func runApp(cmd *cobra.Command, args []string) {
	// For agent division, run the agent loop
	// Note: In a pure web setup, the "agent" might be a separate binary
	// but we keep the logic here for the monolith pattern.
	if os.Getenv("SENT_MODE") == "agent" {
		agent.Run()
		return
	}

	dbClient := database.NewPostgresClient()
	defer dbClient.Close()

	orchestrator.RegisterStockHooks(dbClient)

	runServer(dbClient)
}

func runServer(db *pgxpool.Pool) {
	fmt.Printf("[SERVER] Starting SENT API Server on port %d...\n", port)
	
	centralOrchestrator := orchestrator.NewOrchestrator(db)
	
	// Initialize Domain Bridges (Logic Layer)
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

	// Setup RPC Dispatcher (The core interface for the Next.js frontend)
	rpcHandler := rpc.NewRpcHandler()
	rpcHandler.Register("auth", "AuthBridge", authBridge)
	rpcHandler.Register("capital", "CapitalBridge", capitalBridge)
	rpcHandler.Register("stock", "StockBridge", stockBridge)
	rpcHandler.Register("stock", "KioskBridge", kioskBridge)
	rpcHandler.Register("pilot", "PilotBridge", pilotBridge)
	rpcHandler.Register("peripherals", "PeripheralsBridge", peripheralsBridge)
	rpcHandler.Register("people", "PeopleBridge", peopleBridge)
	rpcHandler.Register("pulse", "PulseBridge", pulseBridge)

	// Setup Echo
	e := echo.New()
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	
	// CORS is essential for Next.js (usually on :3000) to talk to Go (usually on :8080)
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins: []string{"http://localhost:3000", "https://sent.jo"},
		AllowHeaders: []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAccept},
	}))

	// RPC Endpoint - The single entry point for all frontend calls
	e.POST("/api/rpc", echo.WrapHandler(rpcHandler))

	// Health Check
	e.GET("/health", func(c echo.Context) error {
		return c.String(http.StatusOK, "SENT API: OK")
	})

	// Start everything
	ctx := context.Background()
	centralOrchestrator.Start(ctx)
	
	// Startup routine for services that need it
	authBridge.Startup(ctx)
	capitalBridge.Startup(ctx)
	stockBridge.Startup(ctx)
	
	go func() {
		if err := e.Start(fmt.Sprintf(":%d", port)); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Shutting down the server: %v", err)
		}
	}()

	// Graceful Shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt, syscall.SIGTERM)
	<-quit
	fmt.Println("[SERVER] Shutting down gracefully...")
}
