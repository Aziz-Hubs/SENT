package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"golang.org/x/net/http2"
	"golang.org/x/net/http2/h2c"

	platform "sent-platform/internal/core/db/platform/gen"
	"sent-platform/internal/core/onboarding"
	"sent-platform/internal/infra/zitadel"
	"sent-platform/internal/modules/sentmsp"
)

func main() {
	// Load .env file
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	// Initialize Echo instance
	e := echo.New()

	// Middleware
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	// CORS Configuration
	corsOrigins := os.Getenv("CORS_ORIGINS")
	if corsOrigins == "" {
		corsOrigins = "http://localhost:3000"
	}
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins: strings.Split(corsOrigins, ","),
		AllowMethods: []string{http.MethodGet, http.MethodPut, http.MethodPost, http.MethodDelete},
	}))

	// Database Connection
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		dbURL = "postgres://postgres:postgres@localhost:5433/postgres?sslmode=disable"
	}

	dbPool, err := pgxpool.New(context.Background(), dbURL)
	if err != nil {
		log.Fatalf("Unable to connect to database: %v", err)
	}
	defer dbPool.Close()

	// Identity Provider Client (ZITADEL)
	zitadelURL := os.Getenv("ZITADEL_URL")
	if zitadelURL == "" {
		zitadelURL = "http://localhost:8080"
	}
	zitadelPAT := os.Getenv("ZITADEL_PAT")
	if zitadelPAT == "" {
		log.Println("⚠️ ZITADEL_PAT not set. Identity provisioning will fail unless mocked or unauthenticated.")
	}

	zitadelClient := zitadel.NewClient(zitadelURL, zitadelPAT)

	// Initialize Services
	platformQueries := platform.New(dbPool)
	onboardingService := onboarding.NewService(platformQueries, dbPool, zitadelClient)
	onboardingHandler := onboarding.NewHandler(onboardingService)

	// API Group
	api := e.Group("/api/v1")

	// Register Routes
	onboardingHandler.RegisterRoutes(api)

	// Initialize and Register SENTmsp Module
	mspModule := sentmsp.NewModule(dbPool)
	mspModule.RegisterRoutes(e)
	mspModule.StartBackgroundJobs(context.Background())

	// Basic route
	e.GET("/", func(c echo.Context) error {
		return c.String(http.StatusOK, "🚀 SENT Platform 5.0 API Running")
	})

	// Start server with h2c support for ConnectRPC
	h2s := &http2.Server{}
	handler := h2c.NewHandler(e, h2s)

	log.Println("🚀 SENT Platform 5.0 API starting on :8081...")
	if err := http.ListenAndServe(":8081", handler); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}
