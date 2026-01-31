package bridge

import (
	"context"
    "net/http"
	"sent/ent"
	"sent/pkg/pulse"
	"sent/pkg/pulse/agent"
    "sent/pkg/pulse/common"

	"github.com/jackc/pgx/v5"
	"github.com/riverqueue/river"
)

type PulseBridge struct {
	ctx     context.Context
	db      *ent.Client
	manager *pulse.PulseManager
	worker  *pulse.PulseWorker
    scripts *pulse.ScriptManager
    jobs    *pulse.JobManager
}

func NewPulseBridge(db *ent.Client) *PulseBridge {
	// For MVP, we pass nil for river client if not easily available in bridge layer.
	// In production, this should be initialized in main and passed down.
	manager := pulse.NewPulseManager(db, nil)
	worker := pulse.NewPulseWorker(manager)
	
    scripts := pulse.NewScriptManager(db)
    jobs := pulse.NewJobManager(db)
	
	return &PulseBridge{
		db:      db,
		manager: manager,
		worker:  worker,
        scripts: scripts,
        jobs:    jobs,
	}
}

func (b *PulseBridge) SetRiverClient(r *river.Client[pgx.Tx]) {
	if b.manager != nil {
		b.manager.SetRiverClient(r)
	}
}


func (b *PulseBridge) Startup(ctx context.Context) {
	b.ctx = ctx
	// Start the ingestion worker in the background
	go b.worker.Start(ctx)

    // Start WebSocket Server for Terminal (MVP)
    go func() {
        mux := http.NewServeMux()
        mux.HandleFunc("/api/pulse/terminal/", b.HandleTerminalConnect)
        mux.HandleFunc("/rdp/stream", b.HandleRDPStream)
        mux.HandleFunc("/rdp/view", b.HandleRDPView)
        if err := http.ListenAndServe(":8000", mux); err != nil {
            // Log but don't crash main app
           // fmt.Printf("[BRIDGE] WS Server failed: %v\n", err)
        }
    }()
}

// GetAgents returns a list of registered agents.
func (b *PulseBridge) GetAgents() ([]*ent.Agent, error) {
	return b.db.Agent.Query().All(b.ctx)
}

// SendCommand sends a remote command to an agent.
// SendCommand sends a remote command to an agent.
func (b *PulseBridge) SendCommand(agentID string, cmd string) error {
	return b.worker.PublishCommand(agentID, cmd)
}

// GetServices fetches services from agent
func (b *PulseBridge) GetServices(agentID string) ([]agent.ServiceInfo, error) {
    return agent.GetServices()
}

// ControlService changes service state
func (b *PulseBridge) ControlService(agentID string, name string, action string) error {
    return agent.ControlService(name, action)
}

// ListFiles fetches files from agent
func (b *PulseBridge) ListFiles(agentID string, path string) ([]agent.FileInfo, error) {
    return agent.ListFiles(path)
}

// --- Script Management ---

type ScriptDTO struct {
    ID          int    `json:"id"`
    Name        string `json:"name"`
    Description string `json:"description"`
    Content     string `json:"content"`
    Type        string `json:"type"`
}

func (b *PulseBridge) CreateScript(name, description, content, scriptType string) (*ScriptDTO, error) {
    // Hardcoded tenant for MVP
    s, err := b.scripts.CreateScript(b.ctx, "Acuative Corporation", name, description, content, scriptType)
    if err != nil {
        return nil, err
    }
    return &ScriptDTO{
        ID:          s.ID,
        Name:        s.Name,
        Description: s.Description,
        Content:     s.Content,
        Type:        string(s.Type),
    }, nil
}

func (b *PulseBridge) ListScripts() ([]*ScriptDTO, error) {
    scripts, err := b.scripts.ListScripts(b.ctx, "Acuative Corporation")
    if err != nil {
        return nil, err
    }
    
    var dtos []*ScriptDTO
    for _, s := range scripts {
        dtos = append(dtos, &ScriptDTO{
            ID:          s.ID,
            Name:        s.Name,
            Description: s.Description,
            Content:     s.Content,
            Type:        string(s.Type),
        })
    }
    return dtos, nil
}

func (b *PulseBridge) UpdateScript(id int, content string) (*ScriptDTO, error) {
    s, err := b.scripts.UpdateScript(b.ctx, id, content)
    if err != nil {
        return nil, err
    }
    return &ScriptDTO{
        ID:          s.ID,
        Name:        s.Name,
        Description: s.Description,
        Content:     s.Content,
        Type:        string(s.Type),
    }, nil
}

func (b *PulseBridge) DeleteScript(id int) error {
    return b.scripts.DeleteScript(b.ctx, id)
}

// --- Job Management ---

type JobDTO struct {
    ID          int    `json:"id"`
    Name        string `json:"name"`
    Schedule    string `json:"schedule"`
    Targets     []string `json:"targets"`
    ScriptName  string `json:"script_name"`
    ScriptID    int    `json:"script_id"`
    LastRun     string `json:"last_run"`
    NextRun     string `json:"next_run"`
}

func (b *PulseBridge) CreateJob(name string, scriptID int, targets []string, schedule string) (*JobDTO, error) {
    j, err := b.jobs.CreateJob(b.ctx, "Acuative Corporation", name, scriptID, targets, schedule)
    if err != nil {
        return nil, err
    }
    return &JobDTO{
        ID:       j.ID,
        Name:     j.Name,
        Schedule: j.CronSchedule,
        Targets:  j.Targets,
    }, nil
}

func (b *PulseBridge) ListJobs() ([]*JobDTO, error) {
    jobs, err := b.jobs.ListJobs(b.ctx, "Acuative Corporation")
    if err != nil {
        return nil, err
    }
    var dtos []*JobDTO
    for _, j := range jobs {
        dto := &JobDTO{
            ID:       j.ID,
            Name:     j.Name,
            Schedule: j.CronSchedule,
            Targets:  j.Targets,
        }
        if j.Edges.Script != nil {
            dto.ScriptName = j.Edges.Script.Name
            dto.ScriptID = j.Edges.Script.ID
        }
        if !j.LastRun.IsZero() {
            dto.LastRun = j.LastRun.String()
        }
        if !j.NextRun.IsZero() {
            dto.NextRun = j.NextRun.String()
        }
        dtos = append(dtos, dto)
    }
    return dtos, nil
}

// --- Patch Management ---

// ScanPatches triggers a patch scan on the agent and returns pending patches
func (b *PulseBridge) ScanPatches(agentID string) ([]agent.PatchInfo, error) {
    return agent.GetPendingPatches()
}

// InstallPatches triggers patch installation on the agent
func (b *PulseBridge) InstallPatches(agentID string, patchIDs []string) error {
    return agent.InstallPatches(patchIDs)
}

// --- New Core Features ---

// RebootDevice restarts the agent machine
func (b *PulseBridge) RebootDevice(agentID string) error {
    // In a real distributed system, we would publish a "reboot" command via Redis/Centrifugo.
    // For local dev/MVP where Bridge runs alongside Agent logic (monolith simulation):
    return agent.RebootSystem()
}

// ShutdownDevice shuts down the agent machine
func (b *PulseBridge) ShutdownDevice(agentID string) error {
    return agent.ShutdownSystem()
}

// GetEventLogs fetches system logs
func (b *PulseBridge) GetEventLogs(agentID string) ([]agent.LogEntry, error) {
    return agent.GetSystemLogs()
}

// GetEnvVars fetches environment variables
func (b *PulseBridge) GetEnvVars(agentID string) ([]agent.EnvVar, error) {
    return agent.GetEnvironmentVariables(), nil
}

// GetProcesses fetches running processes
func (b *PulseBridge) GetProcesses(agentID string) ([]agent.ProcessInfo, error) {
    return agent.GetProcesses()
}

// KillProcess terminates a process
func (b *PulseBridge) KillProcess(agentID string, pid int32) error {
    return agent.KillProcess(pid)
}

// DownloadFile reads a file from the agent
func (b *PulseBridge) DownloadFile(agentID string, path string) ([]byte, error) {
    return agent.ReadFile(path)
}

// DeleteFile deletes a file from the agent
func (b *PulseBridge) DeleteFile(agentID string, path string) error {
    return agent.DeleteFile(path)
}

// GetSoftwareInventory fetches installed software
func (b *PulseBridge) GetSoftwareInventory(agentID string) ([]common.SoftwareInfo, error) {
    return agent.GetInstalledSoftware(), nil
}