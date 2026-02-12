package sentmsp

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/labstack/echo/v4"

	"sent-platform/internal/modules/sentmsp/sentpulse/api"
	"sent-platform/internal/modules/sentmsp/sentpulse/core"
	"sent-platform/internal/modules/sentmsp/sentpulse/store"
	"sent-platform/pkg/proto/sentpulse/v1/sentpulsev1connect"
)

// Module is the SENTmsp module containing all MSP division services.
type Module struct {
	PulseService *api.DashboardService
	AgentService *api.AgentService
	AlertWorker  *core.AlertWorker
}

// NewModule creates a new SENTmsp module with all services initialized.
func NewModule(db *pgxpool.Pool) *Module {
	// Create repos for worker
	deviceRepo := store.NewDeviceRepository(db)
	alertRepo := store.NewAlertRepository(db)
	settingsRepo := store.NewSettingsRepository(db)
	worker := core.NewAlertWorker(deviceRepo, alertRepo, settingsRepo)

	// Create File Session Manager
	fileSessionManager := api.NewFileSessionManager()

	return &Module{
		PulseService: api.NewDashboardService(db, fileSessionManager),
		AgentService: api.NewAgentService(db, fileSessionManager),
		AlertWorker:  worker,
	}
}

// StartBackgroundJobs starts background workers.
func (m *Module) StartBackgroundJobs(ctx context.Context) {
	go m.AlertWorker.Run(ctx)
}

// RegisterRoutes registers all SENTmsp routes with the Echo server.
func (m *Module) RegisterRoutes(e *echo.Echo) {
	// Register SENTpulse DashboardService (Frontend)
	path, handler := sentpulsev1connect.NewDashboardServiceHandler(m.PulseService)
	e.Any(path+"*", echo.WrapHandler(handler))

	// Register SENTpulse AgentService (Agents) via ConnectRPC
	agentPath, agentHandler := sentpulsev1connect.NewAgentServiceHandler(m.AgentService)
	e.Any(agentPath+"*", echo.WrapHandler(agentHandler))

	// Register Frontend WebSocket for Terminal
	e.GET("/api/v1/ws/terminal", m.AgentService.HandleTerminalWebSocket)

	// Register Agent WebSocket for Terminal (Agent connects here)
	e.GET("/api/v1/ws/terminal/agent", m.AgentService.HandleAgentWebSocket)
}
