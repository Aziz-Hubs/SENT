package api

import (
	"context"
	"fmt"

	"sent-platform/internal/modules/sentmsp/sentpulse/core"
	sentpulsev1 "sent-platform/pkg/proto/sentpulse/v1"

	"connectrpc.com/connect"
)

// RebootDevice creates a reboot job.
func (s *DashboardService) RebootDevice(ctx context.Context, req *connect.Request[sentpulsev1.RebootDeviceRequest]) (*connect.Response[sentpulsev1.RebootDeviceResponse], error) {
	device, err := s.deviceRepo.GetDevice(ctx, req.Msg.DeviceId)
	if err != nil {
		return nil, connect.NewError(connect.CodeInternal, err)
	}
	if device == nil {
		return nil, connect.NewError(connect.CodeNotFound, fmt.Errorf("device not found"))
	}

	cmd := "Restart-Computer -Force"
	if device.OS == core.OSLinux || device.OS == core.OSMacOS {
		cmd = "reboot"
	}

	// Use dedicated Reboot language
	systemUser := "system"
	execution := &core.ScriptExecution{
		DeviceID:      req.Msg.DeviceId,
		ExecutedBy:    &systemUser, // TODO: Get from auth context
		Status:        core.ExecutionStatusPending,
		AdhocCommand:  cmd,
		AdhocLanguage: core.ScriptLanguageReboot,
	}

	if err := s.scriptRepo.CreateExecution(ctx, execution); err != nil {
		return nil, connect.NewError(connect.CodeInternal, err)
	}

	return connect.NewResponse(&sentpulsev1.RebootDeviceResponse{JobId: execution.ID}), nil
}

// ShutdownDevice creates a shutdown job.
func (s *DashboardService) ShutdownDevice(ctx context.Context, req *connect.Request[sentpulsev1.ShutdownDeviceRequest]) (*connect.Response[sentpulsev1.ShutdownDeviceResponse], error) {
	device, err := s.deviceRepo.GetDevice(ctx, req.Msg.DeviceId)
	if err != nil {
		return nil, connect.NewError(connect.CodeInternal, err)
	}
	if device == nil {
		return nil, connect.NewError(connect.CodeNotFound, fmt.Errorf("device not found"))
	}

	cmd := "Stop-Computer -Force"
	if device.OS == core.OSLinux || device.OS == core.OSMacOS {
		cmd = "shutdown -h now"
	}

	// Use dedicated Shutdown language
	systemUser := "system"
	execution := &core.ScriptExecution{
		DeviceID:      req.Msg.DeviceId,
		ExecutedBy:    &systemUser, // TODO: Get from auth context
		Status:        core.ExecutionStatusPending,
		AdhocCommand:  cmd,
		AdhocLanguage: core.ScriptLanguageShutdown,
	}

	if err := s.scriptRepo.CreateExecution(ctx, execution); err != nil {
		return nil, connect.NewError(connect.CodeInternal, err)
	}

	return connect.NewResponse(&sentpulsev1.ShutdownDeviceResponse{JobId: execution.ID}), nil
}

// RunScript creates a script execution job.
func (s *DashboardService) RunScript(ctx context.Context, req *connect.Request[sentpulsev1.RunScriptRequest]) (*connect.Response[sentpulsev1.RunScriptResponse], error) {
	// Validation
	if req.Msg.ScriptId == nil && req.Msg.InlineScript == "" {
		return nil, connect.NewError(connect.CodeInvalidArgument, fmt.Errorf("must provide script_id or inline_script"))
	}

	systemUser := "system"
	execution := &core.ScriptExecution{
		DeviceID:     req.Msg.DeviceId,
		ExecutedBy:   &systemUser, // TODO: Get from auth context
		Status:       core.ExecutionStatusPending,
		ScriptID:     req.Msg.ScriptId,
		AdhocCommand: req.Msg.InlineScript,
	}

	if req.Msg.Language != nil {
		execution.AdhocLanguage = mapProtoScriptLanguage(*req.Msg.Language)
	} else if req.Msg.InlineScript != "" {
		// Default to Powershell if not specified for inline
		execution.AdhocLanguage = core.ScriptLanguagePowerShell
	}

	if err := s.scriptRepo.CreateExecution(ctx, execution); err != nil {
		return nil, connect.NewError(connect.CodeInternal, err)
	}

	return connect.NewResponse(&sentpulsev1.RunScriptResponse{JobId: execution.ID}), nil
}

func mapProtoScriptLanguage(l sentpulsev1.ScriptLanguage) core.ScriptLanguage {
	switch l {
	case sentpulsev1.ScriptLanguage_SCRIPT_LANGUAGE_POWERSHELL:
		return core.ScriptLanguagePowerShell
	case sentpulsev1.ScriptLanguage_SCRIPT_LANGUAGE_BASH:
		return core.ScriptLanguageBash
	case sentpulsev1.ScriptLanguage_SCRIPT_LANGUAGE_PYTHON:
		return core.ScriptLanguagePython
	default:
		return core.ScriptLanguagePowerShell
	}
}
