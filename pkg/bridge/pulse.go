package bridge

import (
	"context"
    "net/http"
	"sent/ent"
	"sent/pkg/pulse"
	"sent/pkg/pulse/agent"
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

func (b *PulseBridge) Startup(ctx context.Context) {
	b.ctx = ctx
	// Start the ingestion worker in the background
	go b.worker.Start(ctx)

    // Start WebSocket Server for Terminal (MVP)
    go func() {
        mux := http.NewServeMux()
        mux.HandleFunc("/api/pulse/terminal/", b.HandleTerminalConnect)
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