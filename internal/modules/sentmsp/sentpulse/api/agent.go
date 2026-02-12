package api

import (
	"context"
	"errors"
	"log"
	"os"

	"sent-platform/internal/modules/sentmsp/sentpulse/core"
	"sent-platform/internal/modules/sentmsp/sentpulse/store"
	sentpulsev1 "sent-platform/pkg/proto/sentpulse/v1"

	"connectrpc.com/connect"
	"github.com/jackc/pgx/v5/pgxpool"
)

// AgentService implements the AgentService API.
type AgentService struct {
	db                 *pgxpool.Pool
	fileSessionManager *FileSessionManager
}

// NewAgentService creates a new AgentService.
func NewAgentService(db *pgxpool.Pool, m *FileSessionManager) *AgentService {
	return &AgentService{
		db:                 db,
		fileSessionManager: m,
	}
}

// CheckIn handles agent heartbeats.
func (s *AgentService) CheckIn(
	ctx context.Context,
	req *connect.Request[sentpulsev1.CheckInRequest],
) (*connect.Response[sentpulsev1.CheckInResponse], error) {

	// Log the check-in
	log.Printf("Agent CheckIn: %s (Org: %s)", req.Msg.Device.Name, req.Msg.OrganizationId)

	// Persist Device
	repo := store.NewDeviceRepository(s.db)

	// Map Proto to Core
	device := &core.Device{
		OrganizationID: req.Msg.OrganizationId,
		Name:           req.Msg.Device.Name,
		Type:           mapProtoDeviceType(req.Msg.Device.Type),
		Status:         mapProtoDeviceStatus(req.Msg.Device.Status),
		OS:             mapProtoOS(req.Msg.Device.Os),
		OSVersion:      req.Msg.Device.OsInfo.GetVersion(), // Prefer detailed info
		IP:             req.Msg.Device.Ip,
		CPUUsage:       float32(req.Msg.Device.CpuUsage),
		MemoryUsage:    float32(req.Msg.Device.MemoryUsage),
		DiskUsage:      float32(req.Msg.Device.DiskUsage),
		Tags:           req.Msg.Device.Tags,
		Client:         req.Msg.Device.Client,
		Site:           req.Msg.Device.Site,
		// Extended details
		LocalIP:     req.Msg.Device.LocalIp,
		MACAddress:  req.Msg.Device.MacAddress,
		CurrentUser: req.Msg.Device.CurrentUser,
		OSInfo:      mapProtoOSInfo(req.Msg.Device.OsInfo),
		Hardware:    mapProtoHardware(req.Msg.Device.Hardware),
		Security:    mapProtoSecurity(req.Msg.Device.Security),

		RustDeskID:       req.Msg.Device.RustdeskId,
		RustDeskPassword: req.Msg.Device.RustdeskPassword,
	}

	if req.Msg.Device.Uptime != nil {
		t := req.Msg.Device.Uptime.AsTime()
		device.BootTime = &t
	}

	for _, nic := range req.Msg.Device.NetworkInterfaces {
		device.NetworkInterfaces = append(device.NetworkInterfaces, mapProtoNetworkInterface(nic))
	}
	for _, drive := range req.Msg.Device.StorageDrives {
		device.StorageDrives = append(device.StorageDrives, mapProtoStorageDrive(drive))
	}
	for _, sw := range req.Msg.Device.InstalledSoftware {
		device.InstalledSoftware = append(device.InstalledSoftware, mapProtoInstalledSoftware(sw))
	}
	for _, proc := range req.Msg.Device.Processes {
		device.Processes = append(device.Processes, mapProtoProcess(proc))
	}
	for _, p := range req.Msg.Device.Patches {
		device.Patches = append(device.Patches, mapProtoPatch(p))
	}
	for _, log := range req.Msg.Device.AuditLog {
		device.AuditLog = append(device.AuditLog, mapProtoAuditLog(log))
	}
	for _, svc := range req.Msg.Device.Services {
		device.Services = append(device.Services, mapProtoService(svc))
	}

	upsertedDevice, err := repo.UpsertDevice(ctx, device)
	if err != nil {
		log.Printf("Failed to upsert device: %v", err)
	}

	// Record historical telemetry
	if upsertedDevice != nil {
		if err := repo.RecordTelemetry(ctx, upsertedDevice.ID, device.CPUUsage, device.MemoryUsage, device.DiskUsage); err != nil {
			log.Printf("Failed to record telemetry history: %v", err)
		}
	}

	// Fetch Pending Jobs
	scriptRepo := store.NewScriptRepository(s.db)
	var jobs []*sentpulsev1.Job

	if upsertedDevice != nil {
		pending, err := scriptRepo.GetPendingExecutions(ctx, upsertedDevice.ID)
		if err != nil {
			log.Printf("Failed to fetch pending executions: %v", err)
		} else {
			for _, p := range pending {
				jobType := "shell"
				switch p.AdhocLanguage {
				case core.ScriptLanguagePowerShell:
					jobType = "powershell"
				case core.ScriptLanguageBash:
					jobType = "bash"
				case core.ScriptLanguageReboot:
					jobType = "reboot"
				case core.ScriptLanguageShutdown:
					jobType = "shutdown"
				case core.ScriptLanguageStartService:
					jobType = "start_service"
				case core.ScriptLanguageStopService:
					jobType = "stop_service"
				case core.ScriptLanguageRestartService:
					jobType = "restart_service"
				case core.ScriptLanguageKillProcess:
					jobType = "kill_process"
				case core.ScriptLanguageInstallPatches:
					jobType = "install_patches"
				case core.ScriptLanguageStartFileExplorer:
					jobType = "start_file_explorer"
				}

				jobs = append(jobs, &sentpulsev1.Job{
					Id:      p.ID,
					Type:    jobType,
					Command: p.AdhocCommand,
				})
			}
		}
	}

	return connect.NewResponse(&sentpulsev1.CheckInResponse{
		Status:   "OK",
		Jobs:     jobs,
		DeviceId: upsertedDevice.ID,
		RustdeskConfig: &sentpulsev1.RustDeskConfig{
			IdServer:    getEnv("RUSTDESK_ID_SERVER", "127.0.0.1"),
			RelayServer: getEnv("RUSTDESK_RELAY_SERVER", "127.0.0.1"),
			PublicKey:   getEnv("RUSTDESK_PUBLIC_KEY", "Wlj9qzHJdats1OAcMOPrUY4krmmtXspZa7t6m5aJNhQ="),
		},
	}), nil
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}

// UpdateJobStatus handles job status updates from the agent.
func (s *AgentService) UpdateJobStatus(
	ctx context.Context,
	req *connect.Request[sentpulsev1.UpdateJobStatusRequest],
) (*connect.Response[sentpulsev1.UpdateJobStatusResponse], error) {
	repo := store.NewScriptRepository(s.db)

	// Map status string to enum (simple cast as they match)
	status := core.ExecutionStatus(req.Msg.Status)

	// For MVP, we treat 'result' as stdout.
	stdout := req.Msg.Result
	stderr := "" // TODO: Add stderr to proto if needed separate

	err := repo.UpdateExecutionStatus(ctx, req.Msg.JobId, status, stdout, stderr, int(req.Msg.ExitCode))
	if err != nil {
		log.Printf("Failed to update job status: %v", err)
		return nil, connect.NewError(connect.CodeInternal, err)
	}

	return connect.NewResponse(&sentpulsev1.UpdateJobStatusResponse{}), nil
}

// StreamTerminal handles bidirectional terminal sessions.
func (s *AgentService) StreamTerminal(
	ctx context.Context,
	stream *connect.BidiStream[sentpulsev1.TerminalOutput, sentpulsev1.TerminalInput],
) error {
	// The first message from Agent should identify the session
	req, err := stream.Receive()
	if err != nil {
		return err
	}
	sessionID := req.SessionId
	log.Printf("Agent connected for terminal session: %s", sessionID)

	// Create/Get Session
	session := GlobalSessionManager.CreateSession(sessionID)

	// Ensure cleanup on disconnect
	defer func() {
		log.Printf("Agent disconnected from session: %s", sessionID)
		GlobalSessionManager.RemoveSession(sessionID)
	}()

	// Channel to signal error in goroutines
	errChan := make(chan error, 2)

	// Goroutine 1: Read from Agent Stream (TerminalOutput) -> Session Output (For Frontend)
	go func() {
		// Process the first message we already read
		if len(req.Data) > 0 {
			session.OutputChan <- req
		}

		for {
			msg, err := stream.Receive()
			if err != nil {
				errChan <- err
				return
			}
			session.OutputChan <- msg
		}
	}()

	// Goroutine 2: Read from Session Input (TerminalInput from Frontend) -> Agent Stream
	go func() {
		for {
			select {
			case <-ctx.Done():
				return
			case <-session.Done:
				return
			case input := <-session.InputChan:
				if err := stream.Send(input); err != nil {
					errChan <- err
					return
				}
			}
		}
	}()

	// Wait for error or context done
	select {
	case <-ctx.Done():
		return ctx.Err()
	case err := <-errChan:
		return err
	case <-session.Done:
		return nil
	}
}

// Helpers to map enums
func mapProtoDeviceType(t sentpulsev1.DeviceType) core.DeviceType {
	switch t {
	case sentpulsev1.DeviceType_DEVICE_TYPE_SERVER:
		return core.DeviceTypeServer
	case sentpulsev1.DeviceType_DEVICE_TYPE_WORKSTATION:
		return core.DeviceTypeWorkstation
	case sentpulsev1.DeviceType_DEVICE_TYPE_NETWORK:
		return core.DeviceTypeNetwork
	case sentpulsev1.DeviceType_DEVICE_TYPE_IOT:
		return core.DeviceTypeIOT
	default:
		return core.DeviceTypeWorkstation
	}
}

func mapProtoDeviceStatus(s sentpulsev1.DeviceStatus) core.DeviceStatus {
	switch s {
	case sentpulsev1.DeviceStatus_DEVICE_STATUS_ONLINE:
		return core.DeviceStatusOnline
	case sentpulsev1.DeviceStatus_DEVICE_STATUS_OFFLINE:
		return core.DeviceStatusOffline
	case sentpulsev1.DeviceStatus_DEVICE_STATUS_WARNING:
		return core.DeviceStatusWarning
	case sentpulsev1.DeviceStatus_DEVICE_STATUS_MAINTENANCE:
		return core.DeviceStatusMaintenance
	default:
		return core.DeviceStatusOffline
	}
}

func mapProtoOS(o sentpulsev1.OS) core.OS {
	switch o {
	case sentpulsev1.OS_OS_WINDOWS:
		return core.OSWindows
	case sentpulsev1.OS_OS_LINUX:
		return core.OSLinux
	case sentpulsev1.OS_OS_MACOS:
		return core.OSMacOS
	default:
		return core.OSWindows
	}
}

func mapProtoOSInfo(i *sentpulsev1.OSInfo) *core.OSInfo {
	if i == nil {
		return nil
	}
	return &core.OSInfo{
		Name:         i.Name,
		Version:      i.Version,
		Build:        i.Build,
		Architecture: i.Architecture,
		Platform:     i.Platform,
	}
}

func mapProtoHardware(h *sentpulsev1.HardwareInfo) *core.HardwareInfo {
	if h == nil {
		return nil
	}
	return &core.HardwareInfo{
		Manufacturer:   h.Manufacturer,
		Model:          h.Model,
		SerialNumber:   h.SerialNumber,
		BIOSVersion:    h.BiosVersion,
		ProcessorModel: h.ProcessorModel,
		ProcessorCores: h.ProcessorCores,
		RAMTotalBytes:  h.RamTotalBytes,
		RAMUsedBytes:   h.RamUsedBytes,
	}
}

func mapProtoNetworkInterface(n *sentpulsev1.NetworkInterface) core.NetworkInterface {
	return core.NetworkInterface{
		Name:       n.Name,
		MACAddress: n.MacAddress,
		IPv4:       n.IpV4,
		IPv6:       n.IpV6,
		Status:     n.Status,
	}
}

func mapProtoStorageDrive(s *sentpulsev1.StorageDrive) core.StorageDrive {
	return core.StorageDrive{
		Name:        s.Name,
		Model:       s.Model,
		TotalBytes:  s.TotalBytes,
		UsedBytes:   s.UsedBytes,
		SmartStatus: s.SmartStatus,
		Type:        s.Type,
	}
}

func mapProtoInstalledSoftware(s *sentpulsev1.InstalledSoftware) core.InstalledSoftware {
	sw := core.InstalledSoftware{
		Name:      s.Name,
		Version:   s.Version,
		Publisher: s.Publisher,
	}
	if s.InstallDate != nil {
		t := s.InstallDate.AsTime()
		sw.InstallDate = &t
	}
	return sw
}

func mapProtoProcess(p *sentpulsev1.DeviceProcess) core.DeviceProcess {
	return core.DeviceProcess{
		PID:         p.Pid,
		Name:        p.Name,
		CPUPercent:  p.CpuPercent,
		MemoryBytes: p.MemoryBytes,
		User:        p.User,
		Status:      p.Status,
	}
}

func mapProtoPatch(p *sentpulsev1.Patch) core.Patch {
	pt := core.Patch{
		ID:          p.Id,
		KBID:        p.KbId,
		Title:       p.Title,
		Description: p.Description,
		Category:    p.Category.String(),
		Severity:    p.Severity.String(),
		SizeBytes:   p.SizeBytes,
		Status:      p.Status.String(),
	}
	if p.ReleaseDate != nil {
		t := p.ReleaseDate.AsTime()
		pt.ReleaseDate = &t
	}
	if p.InstallDate != nil {
		t := p.InstallDate.AsTime()
		pt.InstallDate = &t
	}
	return pt
}

func mapProtoService(s *sentpulsev1.ServiceItem) core.ServiceItem {
	return core.ServiceItem{
		Name:        s.Name,
		DisplayName: s.DisplayName,
		Status:      s.Status,
		StartType:   s.StartType,
		Description: s.Description,
	}
}

// StreamFileExplorer handles bidirectional streaming for file explorer
func (s *AgentService) StreamFileExplorer(
	ctx context.Context,
	stream *connect.BidiStream[sentpulsev1.FileExplorerMessage, sentpulsev1.FileExplorerMessage],
) error {
	// 1. Wait for first message to identify device
	msg, err := stream.Receive()
	if err != nil {
		log.Printf("StreamFileExplorer receive error: %v", err)
		return err
	}

	deviceID := msg.SessionId
	if deviceID == "" {
		return connect.NewError(connect.CodeInvalidArgument, errors.New("missing session_id (device_id)"))
	}

	log.Printf("Starting File Explorer stream for device: %s", deviceID)

	// 2. Register Session
	session := s.fileSessionManager.RegisterSession(deviceID, stream)
	defer s.fileSessionManager.UnregisterSession(deviceID)

	// 3. Listen for responses from Agent
	for {
		msg, err := stream.Receive()
		if err != nil {
			log.Printf("File Explorer stream closed for %s: %v", deviceID, err)
			return err
		}

		// This message is a response to a dashboard request
		// Dispatch it to the waiting request channel
		session.HandleResponse(msg)
	}
}

func mapProtoSecurity(s *sentpulsev1.SecurityPosture) *core.SecurityPosture {
	if s == nil {
		return nil
	}
	sec := &core.SecurityPosture{
		FirewallEnabled:   s.FirewallEnabled,
		EncryptionEnabled: s.EncryptionEnabled,
	}
	if s.Antivirus != nil {
		sec.Antivirus = &core.AntivirusInfo{
			Name:      s.Antivirus.Name,
			Status:    s.Antivirus.Status,
			IsUpdated: s.Antivirus.IsUpdated,
		}
	}
	return sec
}

func mapProtoAuditLog(a *sentpulsev1.AuditLogEntry) core.AuditLogEntry {
	entry := core.AuditLogEntry{
		ID:       a.Id,
		User:     a.User,
		Category: a.Category,
		Details:  a.Details,
	}
	if a.Timestamp != nil {
		entry.Timestamp = a.Timestamp.AsTime()
	}
	return entry
}
