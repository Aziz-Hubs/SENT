// Package api provides the ConnectRPC service implementation for SENTpulse.
package api

import (
	"context"
	"fmt"
	"strings"
	"time"

	"connectrpc.com/connect"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"google.golang.org/protobuf/types/known/timestamppb"

	"sent-platform/internal/modules/sentmsp/sentpulse/core"
	"sent-platform/internal/modules/sentmsp/sentpulse/store"
	sentpulsev1 "sent-platform/pkg/proto/sentpulse/v1"
)

// DashboardService implements the DashboardService RPC handlers.
type DashboardService struct {
	deviceRepo         *store.DeviceRepository
	alertRepo          *store.AlertRepository
	scriptRepo         *store.ScriptRepository
	settingsRepo       *store.SettingsRepository
	fileSessionManager *FileSessionManager
}

// NewDashboardService creates a new DashboardService.
func NewDashboardService(db *pgxpool.Pool, sessionManager *FileSessionManager) *DashboardService {
	return &DashboardService{
		deviceRepo:         store.NewDeviceRepository(db),
		alertRepo:          store.NewAlertRepository(db),
		scriptRepo:         store.NewScriptRepository(db),
		settingsRepo:       store.NewSettingsRepository(db),
		fileSessionManager: sessionManager,
	}
}

// ListDevices returns a paginated list of devices.
func (s *DashboardService) ListDevices(
	ctx context.Context,
	req *connect.Request[sentpulsev1.ListDevicesRequest],
) (*connect.Response[sentpulsev1.ListDevicesResponse], error) {
	pageSize := req.Msg.PageSize
	if pageSize <= 0 {
		pageSize = 50
	}

	// Parse page token as offset (simplified pagination)
	offset := int32(0)

	devices, total, err := s.deviceRepo.ListDevices(ctx, req.Msg.OrganizationId, pageSize, offset)
	if err != nil {
		return nil, connect.NewError(connect.CodeInternal, err)
	}

	protoDevices := make([]*sentpulsev1.Device, len(devices))
	for i, d := range devices {
		protoDevices[i] = deviceToProto(&d)
	}

	return connect.NewResponse(&sentpulsev1.ListDevicesResponse{
		Devices:    protoDevices,
		TotalCount: total,
	}), nil
}

// GetDevice returns a single device by ID.
func (s *DashboardService) GetDevice(
	ctx context.Context,
	req *connect.Request[sentpulsev1.GetDeviceRequest],
) (*connect.Response[sentpulsev1.Device], error) {
	device, err := s.deviceRepo.GetDevice(ctx, req.Msg.DeviceId)
	if err != nil {
		return nil, connect.NewError(connect.CodeInternal, err)
	}
	if device == nil {
		return nil, connect.NewError(connect.CodeNotFound, nil)
	}

	return connect.NewResponse(deviceToProto(device)), nil
}

// GetStats returns aggregated statistics.
func (s *DashboardService) GetStats(
	ctx context.Context,
	req *connect.Request[sentpulsev1.GetStatsRequest],
) (*connect.Response[sentpulsev1.Stats], error) {
	stats, err := s.deviceRepo.GetStats(ctx, req.Msg.OrganizationId)
	if err != nil {
		return nil, connect.NewError(connect.CodeInternal, err)
	}

	return connect.NewResponse(&sentpulsev1.Stats{
		TotalDevices:   stats.TotalDevices,
		Online:         stats.Online,
		Offline:        stats.Offline,
		Warning:        stats.Warning,
		CriticalAlerts: stats.CriticalAlerts,
		HealthScore:    stats.HealthScore,
	}), nil
}

// ListAlerts returns alerts for an organization.
func (s *DashboardService) ListAlerts(
	ctx context.Context,
	req *connect.Request[sentpulsev1.ListAlertsRequest],
) (*connect.Response[sentpulsev1.ListAlertsResponse], error) {
	limit := req.Msg.PageSize
	if limit <= 0 {
		limit = 20
	}
	if req.Msg.Limit != nil && *req.Msg.Limit > 0 {
		limit = *req.Msg.Limit
	}

	unresolvedOnly := false
	if req.Msg.UnresolvedOnly != nil {
		unresolvedOnly = *req.Msg.UnresolvedOnly
	}

	alerts, err := s.alertRepo.ListAlerts(ctx, req.Msg.OrganizationId, limit, unresolvedOnly)
	if err != nil {
		return nil, connect.NewError(connect.CodeInternal, err)
	}

	protoAlerts := make([]*sentpulsev1.Alert, len(alerts))
	for i, a := range alerts {
		protoAlerts[i] = alertToProto(&a)
	}

	return connect.NewResponse(&sentpulsev1.ListAlertsResponse{
		Alerts: protoAlerts,
	}), nil
}

// AcknowledgeAlert marks an alert as acknowledged.
func (s *DashboardService) AcknowledgeAlert(
	ctx context.Context,
	req *connect.Request[sentpulsev1.AcknowledgeAlertRequest],
) (*connect.Response[sentpulsev1.AcknowledgeAlertResponse], error) {
	// TODO: Get user ID from context/auth
	userID := "system"

	err := s.alertRepo.AcknowledgeAlert(ctx, req.Msg.AlertId, userID)
	if err != nil {
		return nil, connect.NewError(connect.CodeInternal, err)
	}

	return connect.NewResponse(&sentpulsev1.AcknowledgeAlertResponse{}), nil
}

// ListScripts returns all scripts for an organization.
func (s *DashboardService) ListScripts(
	ctx context.Context,
	req *connect.Request[sentpulsev1.ListScriptsRequest],
) (*connect.Response[sentpulsev1.ListScriptsResponse], error) {
	scripts, err := s.scriptRepo.ListScripts(ctx, req.Msg.OrganizationId)
	if err != nil {
		return nil, connect.NewError(connect.CodeInternal, err)
	}

	protoScripts := make([]*sentpulsev1.Script, len(scripts))
	for i, sc := range scripts {
		protoScripts[i] = scriptToProto(&sc)
	}

	return connect.NewResponse(&sentpulsev1.ListScriptsResponse{
		Scripts: protoScripts,
	}), nil
}

// GetDeviceTelemetry returns historical telemetry for a device.
func (s *DashboardService) GetDeviceTelemetry(ctx context.Context, req *connect.Request[sentpulsev1.GetDeviceTelemetryRequest]) (*connect.Response[sentpulsev1.GetDeviceTelemetryResponse], error) {
	start := req.Msg.StartTime.AsTime()
	end := req.Msg.EndTime.AsTime()

	if start.IsZero() {
		start = time.Now().Add(-24 * time.Hour)
	}
	if end.IsZero() {
		end = time.Now()
	}

	points, err := s.deviceRepo.GetTelemetryHistory(ctx, req.Msg.DeviceId, start, end)
	if err != nil {
		return nil, connect.NewError(connect.CodeInternal, err)
	}

	protoPoints := make([]*sentpulsev1.TelemetryPoint, len(points))
	for i, p := range points {
		protoPoints[i] = telemetryPointToProto(p)
	}

	return connect.NewResponse(&sentpulsev1.GetDeviceTelemetryResponse{
		Points: protoPoints,
	}), nil
}

// GetPulseSettings returns monitoring settings for an organization.
func (s *DashboardService) GetPulseSettings(ctx context.Context, req *connect.Request[sentpulsev1.GetPulseSettingsRequest]) (*connect.Response[sentpulsev1.PulseSettings], error) {
	settings, err := s.settingsRepo.GetSettings(ctx, req.Msg.OrganizationId)
	if err != nil {
		return nil, connect.NewError(connect.CodeInternal, err)
	}
	return connect.NewResponse(settingsToProto(settings)), nil
}

// UpdatePulseSettings updates monitoring settings for an organization.
func (s *DashboardService) UpdatePulseSettings(ctx context.Context, req *connect.Request[sentpulsev1.UpdatePulseSettingsRequest]) (*connect.Response[sentpulsev1.UpdatePulseSettingsResponse], error) {
	settings := &core.PulseSettings{
		OrganizationID:          req.Msg.Settings.OrganizationId,
		CPUThreshold:            req.Msg.Settings.CpuThreshold,
		MemoryThreshold:         req.Msg.Settings.MemoryThreshold,
		DiskThreshold:           req.Msg.Settings.DiskThreshold,
		OfflineThresholdMinutes: req.Msg.Settings.OfflineThresholdMinutes,
	}

	if err := s.settingsRepo.UpdateSettings(ctx, settings); err != nil {
		return nil, connect.NewError(connect.CodeInternal, err)
	}

	// Fetch updated settings to return
	updated, err := s.settingsRepo.GetSettings(ctx, settings.OrganizationID)
	if err != nil {
		return nil, connect.NewError(connect.CodeInternal, err)
	}

	return connect.NewResponse(&sentpulsev1.UpdatePulseSettingsResponse{
		Settings: settingsToProto(updated),
	}), nil
}

// ListServices returns services for a device.
func (s *DashboardService) ListServices(ctx context.Context, req *connect.Request[sentpulsev1.ListServicesRequest]) (*connect.Response[sentpulsev1.ListServicesResponse], error) {
	device, err := s.deviceRepo.GetDevice(ctx, req.Msg.DeviceId)
	if err != nil {
		return nil, connect.NewError(connect.CodeInternal, err)
	}
	if device == nil {
		return nil, connect.NewError(connect.CodeNotFound, nil)
	}

	resp := &sentpulsev1.ListServicesResponse{}
	for _, svc := range device.Services {
		resp.Services = append(resp.Services, serviceToProto(svc))
	}
	return connect.NewResponse(resp), nil
}

// StartService starts a service on a device.
func (s *DashboardService) StartService(ctx context.Context, req *connect.Request[sentpulsev1.ServiceActionRequest]) (*connect.Response[sentpulsev1.ServiceActionResponse], error) {
	exec := &core.ScriptExecution{
		DeviceID:      req.Msg.DeviceId,
		AdhocCommand:  req.Msg.ServiceName,
		AdhocLanguage: core.ScriptLanguageStartService,
		Status:        core.ExecutionStatusPending,
		CreatedAt:     time.Now(),
	}

	if err := s.scriptRepo.CreateExecution(ctx, exec); err != nil {
		return nil, connect.NewError(connect.CodeInternal, err)
	}

	return connect.NewResponse(&sentpulsev1.ServiceActionResponse{
		JobId: exec.ID,
	}), nil
}

// StopService stops a service on a device.
func (s *DashboardService) StopService(ctx context.Context, req *connect.Request[sentpulsev1.ServiceActionRequest]) (*connect.Response[sentpulsev1.ServiceActionResponse], error) {
	exec := &core.ScriptExecution{
		DeviceID:      req.Msg.DeviceId,
		AdhocCommand:  req.Msg.ServiceName,
		AdhocLanguage: core.ScriptLanguageStopService,
		Status:        core.ExecutionStatusPending,
		CreatedAt:     time.Now(),
	}

	if err := s.scriptRepo.CreateExecution(ctx, exec); err != nil {
		return nil, connect.NewError(connect.CodeInternal, err)
	}

	return connect.NewResponse(&sentpulsev1.ServiceActionResponse{
		JobId: exec.ID,
	}), nil
}

// RestartService restarts a service on a device.
func (s *DashboardService) RestartService(ctx context.Context, req *connect.Request[sentpulsev1.ServiceActionRequest]) (*connect.Response[sentpulsev1.ServiceActionResponse], error) {
	exec := &core.ScriptExecution{
		DeviceID:      req.Msg.DeviceId,
		AdhocCommand:  req.Msg.ServiceName,
		AdhocLanguage: core.ScriptLanguageRestartService,
		Status:        core.ExecutionStatusPending,
		CreatedAt:     time.Now(),
	}

	if err := s.scriptRepo.CreateExecution(ctx, exec); err != nil {
		return nil, connect.NewError(connect.CodeInternal, err)
	}

	return connect.NewResponse(&sentpulsev1.ServiceActionResponse{
		JobId: exec.ID,
	}), nil
}

// ListProcesses returns processes for a device.
func (s *DashboardService) ListProcesses(ctx context.Context, req *connect.Request[sentpulsev1.ListProcessesRequest]) (*connect.Response[sentpulsev1.ListProcessesResponse], error) {
	device, err := s.deviceRepo.GetDevice(ctx, req.Msg.DeviceId)
	if err != nil {
		return nil, connect.NewError(connect.CodeInternal, err)
	}
	if device == nil {
		return nil, connect.NewError(connect.CodeNotFound, nil)
	}

	protoProcesses := make([]*sentpulsev1.DeviceProcess, len(device.Processes))
	for i, p := range device.Processes {
		protoProcesses[i] = &sentpulsev1.DeviceProcess{
			Pid:         p.PID,
			Name:        p.Name,
			CpuPercent:  p.CPUPercent,
			MemoryBytes: p.MemoryBytes,
			User:        p.User,
			Status:      p.Status,
		}
	}

	return connect.NewResponse(&sentpulsev1.ListProcessesResponse{
		Processes: protoProcesses,
	}), nil
}

// KillProcess kills a process on a device.
func (s *DashboardService) KillProcess(ctx context.Context, req *connect.Request[sentpulsev1.KillProcessRequest]) (*connect.Response[sentpulsev1.KillProcessResponse], error) {
	exec := &core.ScriptExecution{
		DeviceID:      req.Msg.DeviceId,
		AdhocCommand:  fmt.Sprintf("%d", req.Msg.Pid),
		AdhocLanguage: core.ScriptLanguageKillProcess,
		Status:        core.ExecutionStatusPending,
		CreatedAt:     time.Now(),
	}

	if err := s.scriptRepo.CreateExecution(ctx, exec); err != nil {
		return nil, connect.NewError(connect.CodeInternal, err)
	}

	return connect.NewResponse(&sentpulsev1.KillProcessResponse{
		JobId: exec.ID,
	}), nil
}

// GetEnvironmentVariables returns environment variables for a device.
func (s *DashboardService) GetEnvironmentVariables(ctx context.Context, req *connect.Request[sentpulsev1.GetEnvironmentVariablesRequest]) (*connect.Response[sentpulsev1.GetEnvironmentVariablesResponse], error) {
	return connect.NewResponse(&sentpulsev1.GetEnvironmentVariablesResponse{
		Variables: []*sentpulsev1.EnvVar{
			{Key: "PATH", Value: "/usr/bin:/bin"},
			{Key: "HOME", Value: "/root"},
		},
	}), nil
}

// ListPatches returns available patches for a device.
func (s *DashboardService) ListPatches(ctx context.Context, req *connect.Request[sentpulsev1.ListPatchesRequest]) (*connect.Response[sentpulsev1.ListPatchesResponse], error) {
	device, err := s.deviceRepo.GetDevice(ctx, req.Msg.DeviceId)
	if err != nil {
		return nil, connect.NewError(connect.CodeInternal, err)
	}
	if device == nil {
		return nil, connect.NewError(connect.CodeNotFound, fmt.Errorf("device not found"))
	}

	resp := &sentpulsev1.ListPatchesResponse{
		LastCheck: timestamppb.New(device.UpdatedAt),
	}
	for _, p := range device.Patches {
		resp.Patches = append(resp.Patches, patchToProto(p))
	}
	return connect.NewResponse(resp), nil
}

// InstallPatches creates a job to install patches on a device.
func (s *DashboardService) InstallPatches(ctx context.Context, req *connect.Request[sentpulsev1.InstallPatchesRequest]) (*connect.Response[sentpulsev1.InstallPatchesResponse], error) {
	// Verify device exists
	device, err := s.deviceRepo.GetDevice(ctx, req.Msg.DeviceId)
	if err != nil {
		return nil, connect.NewError(connect.CodeInternal, err)
	}
	if device == nil {
		return nil, connect.NewError(connect.CodeNotFound, fmt.Errorf("device not found"))
	}

	// Create script execution for patch installation
	// Store patch IDs as comma-separated list in AdhocCommand
	patchIDsStr := ""
	for i, id := range req.Msg.PatchIds {
		if i > 0 {
			patchIDsStr += ","
		}
		patchIDsStr += id
	}

	exec := &core.ScriptExecution{
		DeviceID:      req.Msg.DeviceId,
		AdhocCommand:  patchIDsStr,
		AdhocLanguage: core.ScriptLanguageInstallPatches,
		Status:        core.ExecutionStatusPending,
		CreatedAt:     time.Now(),
	}

	if err := s.scriptRepo.CreateExecution(ctx, exec); err != nil {
		return nil, connect.NewError(connect.CodeInternal, err)
	}

	return connect.NewResponse(&sentpulsev1.InstallPatchesResponse{
		JobId: exec.ID,
	}), nil
}

// --- Converters ---

func deviceToProto(d *core.Device) *sentpulsev1.Device {
	dev := &sentpulsev1.Device{
		Id:          d.ID,
		Name:        d.Name,
		Type:        deviceTypeToProto(d.Type),
		Status:      deviceStatusToProto(d.Status),
		Os:          osToProto(d.OS),
		OsInfo:      osInfoToProto(d.OSInfo),
		Ip:          d.IP,
		LastSeen:    timestamppb.New(d.LastSeen),
		CpuUsage:    d.CPUUsage,
		MemoryUsage: d.MemoryUsage,
		DiskUsage:   d.DiskUsage,
		Tags:        d.Tags,
		Client:      d.Client,
		Site:        d.Site,
		// Extended fields
		LocalIp:     d.LocalIP,
		MacAddress:  d.MACAddress,
		CurrentUser: d.CurrentUser,
		Hardware:    hardwareToProto(d.Hardware),
		Security:    securityToProto(d.Security),
		// Remote Access
		RustdeskId:       d.RustDeskID,
		RustdeskPassword: d.RustDeskPassword,
	}

	if d.BootTime != nil {
		dev.Uptime = timestamppb.New(*d.BootTime)
	}

	for _, nic := range d.NetworkInterfaces {
		dev.NetworkInterfaces = append(dev.NetworkInterfaces, networkInterfaceToProto(nic))
	}
	for _, drive := range d.StorageDrives {
		dev.StorageDrives = append(dev.StorageDrives, storageDriveToProto(drive))
	}
	for _, sw := range d.InstalledSoftware {
		dev.InstalledSoftware = append(dev.InstalledSoftware, installedSoftwareToProto(sw))
	}
	for _, proc := range d.Processes {
		dev.Processes = append(dev.Processes, processToProto(proc))
	}
	for _, patch := range d.Patches {
		dev.Patches = append(dev.Patches, patchToProto(patch))
	}
	for _, log := range d.AuditLog {
		dev.AuditLog = append(dev.AuditLog, auditLogToProto(log))
	}
	for _, svc := range d.Services {
		dev.Services = append(dev.Services, serviceToProto(svc))
	}

	return dev
}

func osInfoToProto(i *core.OSInfo) *sentpulsev1.OSInfo {
	if i == nil {
		return nil
	}
	return &sentpulsev1.OSInfo{
		Name:         i.Name,
		Version:      i.Version,
		Build:        i.Build,
		Architecture: i.Architecture,
		Platform:     i.Platform,
	}
}

func hardwareToProto(h *core.HardwareInfo) *sentpulsev1.HardwareInfo {
	if h == nil {
		return nil
	}
	return &sentpulsev1.HardwareInfo{
		Manufacturer:   h.Manufacturer,
		Model:          h.Model,
		SerialNumber:   h.SerialNumber,
		BiosVersion:    h.BIOSVersion,
		ProcessorModel: h.ProcessorModel,
		ProcessorCores: h.ProcessorCores,
		RamTotalBytes:  h.RAMTotalBytes,
		RamUsedBytes:   h.RAMUsedBytes,
	}
}

func networkInterfaceToProto(n core.NetworkInterface) *sentpulsev1.NetworkInterface {
	return &sentpulsev1.NetworkInterface{
		Name:       n.Name,
		MacAddress: n.MACAddress,
		IpV4:       n.IPv4,
		IpV6:       n.IPv6,
		Status:     n.Status,
	}
}

func storageDriveToProto(s core.StorageDrive) *sentpulsev1.StorageDrive {
	return &sentpulsev1.StorageDrive{
		Name:        s.Name,
		Model:       s.Model,
		TotalBytes:  s.TotalBytes,
		UsedBytes:   s.UsedBytes,
		SmartStatus: s.SmartStatus,
		Type:        s.Type,
	}
}

func installedSoftwareToProto(s core.InstalledSoftware) *sentpulsev1.InstalledSoftware {
	p := &sentpulsev1.InstalledSoftware{
		Name:      s.Name,
		Version:   s.Version,
		Publisher: s.Publisher,
	}
	if s.InstallDate != nil {
		p.InstallDate = timestamppb.New(*s.InstallDate)
	}
	return p
}

func processToProto(p core.DeviceProcess) *sentpulsev1.DeviceProcess {
	return &sentpulsev1.DeviceProcess{
		Pid:         p.PID,
		Name:        p.Name,
		CpuPercent:  p.CPUPercent,
		MemoryBytes: p.MemoryBytes,
		User:        p.User,
		Status:      p.Status,
	}
}

func serviceToProto(s core.ServiceItem) *sentpulsev1.ServiceItem {
	return &sentpulsev1.ServiceItem{
		Name:        s.Name,
		DisplayName: s.DisplayName,
		Status:      s.Status,
		StartType:   s.StartType,
		Description: s.Description,
	}
}

func patchToProto(p core.Patch) *sentpulsev1.Patch {
	proto := &sentpulsev1.Patch{
		Id:          p.ID,
		KbId:        p.KBID,
		Title:       p.Title,
		Description: p.Description,
		Severity:    mapSeverityToProto(p.Severity),
		Category:    mapCategoryToProto(p.Category),
		SizeBytes:   p.SizeBytes,
		Status:      mapStatusToProto(p.Status),
	}
	if p.ReleaseDate != nil {
		proto.ReleaseDate = timestamppb.New(*p.ReleaseDate)
	}
	if p.InstallDate != nil {
		proto.InstallDate = timestamppb.New(*p.InstallDate)
	}
	return proto
}

func mapSeverityToProto(s string) sentpulsev1.PatchSeverity {
	if v, ok := sentpulsev1.PatchSeverity_value[s]; ok {
		return sentpulsev1.PatchSeverity(v)
	}
	// Fallback/Legacy mapping
	switch strings.ToLower(s) {
	case "critical":
		return sentpulsev1.PatchSeverity_PATCH_SEVERITY_CRITICAL
	case "important":
		return sentpulsev1.PatchSeverity_PATCH_SEVERITY_IMPORTANT
	case "moderate":
		return sentpulsev1.PatchSeverity_PATCH_SEVERITY_MODERATE
	case "low":
		return sentpulsev1.PatchSeverity_PATCH_SEVERITY_LOW
	}
	return sentpulsev1.PatchSeverity_PATCH_SEVERITY_UNSPECIFIED
}

func mapCategoryToProto(c string) sentpulsev1.PatchCategory {
	if v, ok := sentpulsev1.PatchCategory_value[c]; ok {
		return sentpulsev1.PatchCategory(v)
	}
	switch strings.ToLower(c) {
	case "security":
		return sentpulsev1.PatchCategory_PATCH_CATEGORY_SECURITY
	case "critical":
		return sentpulsev1.PatchCategory_PATCH_CATEGORY_CRITICAL
	case "updates":
		return sentpulsev1.PatchCategory_PATCH_CATEGORY_UPDATES
	case "drivers":
		return sentpulsev1.PatchCategory_PATCH_CATEGORY_DRIVERS
	}
	return sentpulsev1.PatchCategory_PATCH_CATEGORY_FEATURE
}

func mapStatusToProto(s string) sentpulsev1.PatchStatus {
	if v, ok := sentpulsev1.PatchStatus_value[s]; ok {
		return sentpulsev1.PatchStatus(v)
	}
	switch strings.ToLower(s) {
	case "installed":
		return sentpulsev1.PatchStatus_PATCH_STATUS_INSTALLED
	case "missing", "not_installed":
		return sentpulsev1.PatchStatus_PATCH_STATUS_NOT_INSTALLED
	case "failed":
		return sentpulsev1.PatchStatus_PATCH_STATUS_FAILED
	case "pending":
		return sentpulsev1.PatchStatus_PATCH_STATUS_PENDING
	}
	return sentpulsev1.PatchStatus_PATCH_STATUS_UNSPECIFIED
}

func securityToProto(s *core.SecurityPosture) *sentpulsev1.SecurityPosture {
	if s == nil {
		return nil
	}
	proto := &sentpulsev1.SecurityPosture{
		FirewallEnabled:   s.FirewallEnabled,
		EncryptionEnabled: s.EncryptionEnabled,
	}
	if s.Antivirus != nil {
		proto.Antivirus = &sentpulsev1.AntivirusInfo{
			Name:      s.Antivirus.Name,
			Status:    s.Antivirus.Status,
			IsUpdated: s.Antivirus.IsUpdated,
		}
	}
	return proto
}

func auditLogToProto(a core.AuditLogEntry) *sentpulsev1.AuditLogEntry {
	return &sentpulsev1.AuditLogEntry{
		Id:        a.ID,
		Timestamp: timestamppb.New(a.Timestamp),
		User:      a.User,
		Category:  a.Category,
		Details:   a.Details,
	}
}

func alertToProto(a *core.Alert) *sentpulsev1.Alert {
	return &sentpulsev1.Alert{
		Id:           a.ID,
		DeviceId:     a.DeviceID,
		DeviceName:   a.DeviceName,
		Severity:     alertSeverityToProto(a.Severity),
		Title:        a.Title,
		Description:  a.Description,
		Timestamp:    timestamppb.New(a.CreatedAt),
		Acknowledged: a.Acknowledged,
	}
}

// ListDirectory lists files in a directory on the agent.
func (s *DashboardService) ListDirectory(
	ctx context.Context,
	req *connect.Request[sentpulsev1.ListDirectoryRequest],
) (*connect.Response[sentpulsev1.ListDirectoryResponse], error) {
	deviceID := req.Msg.DeviceId
	if deviceID == "" {
		return nil, connect.NewError(connect.CodeInvalidArgument, fmt.Errorf("device_id is required"))
	}

	session, ok := s.fileSessionManager.GetSession(deviceID)
	if !ok {
		// Log attempt
		fmt.Printf("File Explorer session not found for device %s. Queueing job.\n", deviceID)

		// Create job to start file explorer
		systemUser := "system"
		job := &core.ScriptExecution{
			DeviceID:      deviceID,
			ExecutedBy:    &systemUser,
			Status:        core.ExecutionStatusPending,
			AdhocLanguage: core.ScriptLanguageStartFileExplorer,
			CreatedAt:     time.Now(),
		}

		if err := s.scriptRepo.CreateExecution(ctx, job); err != nil {
			return nil, connect.NewError(connect.CodeInternal, fmt.Errorf("failed to queue file explorer job: %w", err))
		}

		// Return unauthenticated/unavailable to signal client to retry
		return nil, connect.NewError(connect.CodeUnavailable, fmt.Errorf("agent not connected, connecting now..."))
	}

	// Forward request
	respMsg, err := session.SendRequest(ctx, &sentpulsev1.FileExplorerMessage{
		SessionId: deviceID,
		Payload: &sentpulsev1.FileExplorerMessage_ListReq{
			ListReq: req.Msg,
		},
		RequestId: uuid.New().String(), // Generate request ID
	})
	if err != nil {
		return nil, connect.NewError(connect.CodeInternal, fmt.Errorf("agent communication error: %w", err))
	}

	// Extract response
	switch payload := respMsg.Payload.(type) {
	case *sentpulsev1.FileExplorerMessage_ListResp:
		return connect.NewResponse(payload.ListResp), nil
	case *sentpulsev1.FileExplorerMessage_Error:
		return nil, connect.NewError(connect.CodeInternal, fmt.Errorf("agent returned error: %s", payload.Error.Message))
	default:
		return nil, connect.NewError(connect.CodeInternal, fmt.Errorf("unexpected response type from agent"))
	}
}

// ReadFile reads a file from the agent.
func (s *DashboardService) ReadFile(
	ctx context.Context,
	req *connect.Request[sentpulsev1.ReadFileRequest],
) (*connect.Response[sentpulsev1.ReadFileResponse], error) {
	deviceID := req.Msg.DeviceId
	if deviceID == "" {
		return nil, connect.NewError(connect.CodeInvalidArgument, fmt.Errorf("device_id is required"))
	}

	session, ok := s.fileSessionManager.GetSession(deviceID)
	if !ok {
		return nil, connect.NewError(connect.CodeUnavailable, fmt.Errorf("agent not connected"))
	}

	// Forward request
	respMsg, err := session.SendRequest(ctx, &sentpulsev1.FileExplorerMessage{
		SessionId: deviceID,
		Payload: &sentpulsev1.FileExplorerMessage_ReadReq{
			ReadReq: req.Msg,
		},
		RequestId: uuid.New().String(), // Generate request ID
	})
	if err != nil {
		return nil, connect.NewError(connect.CodeInternal, fmt.Errorf("agent communication error: %w", err))
	}

	// Extract response
	switch payload := respMsg.Payload.(type) {
	case *sentpulsev1.FileExplorerMessage_ReadResp:
		return connect.NewResponse(payload.ReadResp), nil
	case *sentpulsev1.FileExplorerMessage_Error:
		return nil, connect.NewError(connect.CodeInternal, fmt.Errorf("agent returned error: %s", payload.Error.Message))
	default:
		return nil, connect.NewError(connect.CodeInternal, fmt.Errorf("unexpected response type from agent"))
	}
}

func scriptToProto(s *core.Script) *sentpulsev1.Script {
	proto := &sentpulsev1.Script{
		Id:          s.ID,
		Name:        s.Name,
		Description: s.Description,
		Language:    scriptLanguageToProto(s.Language),
		SuccessRate: s.SuccessRate,
		Tags:        s.Tags,
	}
	if s.LastRun != nil {
		proto.LastRun = timestamppb.New(*s.LastRun)
	}
	return proto
}

func deviceTypeToProto(t core.DeviceType) sentpulsev1.DeviceType {
	switch t {
	case core.DeviceTypeServer:
		return sentpulsev1.DeviceType_DEVICE_TYPE_SERVER
	case core.DeviceTypeWorkstation:
		return sentpulsev1.DeviceType_DEVICE_TYPE_WORKSTATION
	case core.DeviceTypeNetwork:
		return sentpulsev1.DeviceType_DEVICE_TYPE_NETWORK
	case core.DeviceTypeIOT:
		return sentpulsev1.DeviceType_DEVICE_TYPE_IOT
	default:
		return sentpulsev1.DeviceType_DEVICE_TYPE_UNSPECIFIED
	}
}

func deviceStatusToProto(s core.DeviceStatus) sentpulsev1.DeviceStatus {
	switch s {
	case core.DeviceStatusOnline:
		return sentpulsev1.DeviceStatus_DEVICE_STATUS_ONLINE
	case core.DeviceStatusOffline:
		return sentpulsev1.DeviceStatus_DEVICE_STATUS_OFFLINE
	case core.DeviceStatusWarning:
		return sentpulsev1.DeviceStatus_DEVICE_STATUS_WARNING
	case core.DeviceStatusMaintenance:
		return sentpulsev1.DeviceStatus_DEVICE_STATUS_MAINTENANCE
	default:
		return sentpulsev1.DeviceStatus_DEVICE_STATUS_UNSPECIFIED
	}
}

func osToProto(os core.OS) sentpulsev1.OS {
	switch os {
	case core.OSWindows:
		return sentpulsev1.OS_OS_WINDOWS
	case core.OSLinux:
		return sentpulsev1.OS_OS_LINUX
	case core.OSMacOS:
		return sentpulsev1.OS_OS_MACOS
	default:
		return sentpulsev1.OS_OS_UNSPECIFIED
	}
}

func alertSeverityToProto(s core.AlertSeverity) sentpulsev1.AlertSeverity {
	switch s {
	case core.AlertSeverityInfo:
		return sentpulsev1.AlertSeverity_ALERT_SEVERITY_INFO
	case core.AlertSeverityWarning:
		return sentpulsev1.AlertSeverity_ALERT_SEVERITY_WARNING
	case core.AlertSeverityCritical:
		return sentpulsev1.AlertSeverity_ALERT_SEVERITY_CRITICAL
	default:
		return sentpulsev1.AlertSeverity_ALERT_SEVERITY_UNSPECIFIED
	}
}

func scriptLanguageToProto(l core.ScriptLanguage) sentpulsev1.ScriptLanguage {
	switch l {
	case core.ScriptLanguagePowerShell:
		return sentpulsev1.ScriptLanguage_SCRIPT_LANGUAGE_POWERSHELL
	case core.ScriptLanguageBash:
		return sentpulsev1.ScriptLanguage_SCRIPT_LANGUAGE_BASH
	case core.ScriptLanguagePython:
		return sentpulsev1.ScriptLanguage_SCRIPT_LANGUAGE_PYTHON
	default:
		return sentpulsev1.ScriptLanguage_SCRIPT_LANGUAGE_UNSPECIFIED
	}
}

func telemetryPointToProto(p core.TelemetryPoint) *sentpulsev1.TelemetryPoint {
	return &sentpulsev1.TelemetryPoint{
		Time:        timestamppb.New(p.Time),
		CpuUsage:    p.CPUUsage,
		MemoryUsage: p.MemoryUsage,
		DiskUsage:   p.DiskUsage,
	}
}

func settingsToProto(s *core.PulseSettings) *sentpulsev1.PulseSettings {
	return &sentpulsev1.PulseSettings{
		OrganizationId:          s.OrganizationID,
		CpuThreshold:            s.CPUThreshold,
		MemoryThreshold:         s.MemoryThreshold,
		DiskThreshold:           s.DiskThreshold,
		OfflineThresholdMinutes: s.OfflineThresholdMinutes,
		UpdatedAt:               timestamppb.New(s.UpdatedAt),
	}
}
