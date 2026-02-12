package core

import (
	"context"
	"crypto/tls"
	"fmt"
	"log"
	"net"
	"net/http"
	"os"
	"sync"
	"time"

	"sent-platform/internal/agent/collector"
	"sent-platform/internal/agent/executor"
	"sent-platform/internal/agent/transport"
	sentpulsev1 "sent-platform/pkg/proto/sentpulse/v1"
	"sent-platform/pkg/proto/sentpulse/v1/sentpulsev1connect"

	"sent-platform/internal/agent/remoteaccess"

	"connectrpc.com/connect"
	"golang.org/x/net/http2"
)

type Agent struct {
	Config              Config
	Client              sentpulsev1connect.AgentServiceClient
	TerminalClient      *transport.TerminalClient
	rustdeskMgr         *remoteaccess.RustDeskManager
	ID                  string
	fileExplorerStarted bool
	fileExplorerMu      sync.Mutex
}

type Config struct {
	BackendURL     string
	OrganizationID string // Could be part of a JWT in a real-world scenario
}

func NewAgent(cfg Config) *Agent {
	// Create HTTP/2 transport that supports h2c (cleartext HTTP/2)
	// This is required for gRPC bidirectional streaming without TLS
	h2cClient := &http.Client{
		Transport: &http2.Transport{
			AllowHTTP: true,
			DialTLSContext: func(ctx context.Context, network, addr string, _ *tls.Config) (net.Conn, error) {
				// Use plain TCP for h2c
				var d net.Dialer
				return d.DialContext(ctx, network, addr)
			},
		},
	}

	client := sentpulsev1connect.NewAgentServiceClient(
		h2cClient,
		cfg.BackendURL,
		connect.WithGRPC(), // Use standard gRPC for bidi streaming support
	)
	return &Agent{
		Config:         cfg,
		Client:         client,
		TerminalClient: transport.NewTerminalClient(client),
		rustdeskMgr:    &remoteaccess.RustDeskManager{},
	}
}

func (a *Agent) Start(ctx context.Context) error {
	log.Printf("Starting agent for Org: %s, connecting to %s", a.Config.OrganizationID, a.Config.BackendURL)

	ticker := time.NewTicker(10 * time.Second)
	defer ticker.Stop()

	// Initial check-in
	if err := a.checkIn(ctx); err != nil {
		log.Printf("Initial check-in failed: %v", err)
	}

	// Start file explorer session proactively after first check-in
	a.startFileExplorerIfNeeded(ctx)

	for {
		select {
		case <-ctx.Done():
			return ctx.Err()
		case <-ticker.C:
			if err := a.checkIn(ctx); err != nil {
				log.Printf("Check-in error: %v", err)
			}
			// Ensure file explorer stays alive
			a.startFileExplorerIfNeeded(ctx)
		}
	}
}

// startFileExplorerIfNeeded starts the file explorer stream if not already running
func (a *Agent) startFileExplorerIfNeeded(ctx context.Context) {
	a.fileExplorerMu.Lock()
	if a.fileExplorerStarted || a.ID == "" {
		a.fileExplorerMu.Unlock()
		return
	}
	a.fileExplorerStarted = true
	a.fileExplorerMu.Unlock()

	go func() {
		log.Printf("Proactively starting file explorer session for device: %s", a.ID)
		for {
			if err := executor.HandleFileExplorer(ctx, a.Client, a.ID); err != nil {
				log.Printf("File Explorer session ended with error: %v", err)
				if ctx.Err() != nil {
					return // Context cancelled, stop retrying
				}
				log.Printf("Reconnecting file explorer in 5 seconds...")
				time.Sleep(5 * time.Second)
			} else {
				log.Printf("File Explorer session ended normally, reconnecting...")
				time.Sleep(2 * time.Second)
			}
		}
	}()
}

func (a *Agent) checkIn(ctx context.Context) error {
	// 1. Collect Telemetry
	inv, err := collector.CollectInventory()
	if err != nil {
		return fmt.Errorf("collect failed: %w", err)
	}

	// 2. Prepare Request

	// Quick fix: generic name or reuse existing logic if I had it.
	// Let's rely on what we have.
	// I'll assume we can get hostname from standard lib here or update Inventory later.
	// For MVP, "Agent-<MAC>" is good.
	name := "Agent-Device"
	if inv.MACAddress != "" {
		name = "Agent-" + inv.MACAddress
	} else if inv.LocalIP != "" {
		name = "Agent-" + inv.LocalIP
	}

	req := connect.NewRequest(&sentpulsev1.CheckInRequest{
		OrganizationId: a.Config.OrganizationID,
		Device: &sentpulsev1.Device{
			Name:        name,
			Type:        sentpulsev1.DeviceType_DEVICE_TYPE_WORKSTATION,
			Status:      sentpulsev1.DeviceStatus_DEVICE_STATUS_ONLINE,
			Os:          mapOS(inv.OSInfo.Platform), // "windows", "linux"
			OsInfo:      inv.OSInfo,
			Ip:          inv.LocalIP,
			MacAddress:  inv.MACAddress,
			LocalIp:     inv.LocalIP,
			CpuUsage:    inv.CPUUsage,
			MemoryUsage: inv.MemoryUsage,
			DiskUsage:   inv.DiskUsage,

			// Extended
			Hardware:          inv.Hardware,
			NetworkInterfaces: inv.NetworkInterfaces,
			StorageDrives:     inv.StorageDrives,
			Processes:         inv.Processes,
			Services:          inv.Services,
			Patches:           inv.Patches,
			CurrentUser:       inv.CurrentUser,
			Uptime:            inv.BootTime,

			Site: "Remote",

			RustdeskId: a.rustdeskMgr.GetID(),
		},
	})

	// 1.5 Auto-install RustDesk if configured (best effort)
	go func() {
		if err := a.rustdeskMgr.EnsureInstalled(); err != nil {
			log.Printf("RustDesk ensure installed failed: %v", err)
		}
	}()

	// 3. Send
	resp, err := a.Client.CheckIn(ctx, req)
	if err != nil {
		return err
	}

	if resp.Msg.Status == "OK" {
		// Update Agent ID
		if resp.Msg.DeviceId != "" {
			a.ID = resp.Msg.DeviceId
		}

		// Update RustDesk config if received
		if resp.Msg.RustdeskConfig != nil {
			a.rustdeskMgr.IDServer = resp.Msg.RustdeskConfig.IdServer
			a.rustdeskMgr.Key = resp.Msg.RustdeskConfig.PublicKey

			// Best effort config
			go func() {
				rdPassword := os.Getenv("RUSTDESK_PASSWORD")
				if rdPassword == "" {
					rdPassword = "SentPulse-" + a.ID[:8] // Fallback: unique per device
				}
				_ = a.rustdeskMgr.Configure(rdPassword)
			}()
		}
	}

	// 4. Handle Jobs
	for _, job := range resp.Msg.Jobs {
		log.Printf("Received job: ID=%s Type=%s", job.Id, job.Type)

		if job.Type == "terminal" {
			go func(j *sentpulsev1.Job) {
				log.Printf("Starting terminal session for job %s", j.Id)
				// Use the job ID as the session ID
				if err := a.TerminalClient.StartSession(context.Background(), j.Id); err != nil {
					log.Printf("Terminal session ended with error: %v", err)
				} else {
					log.Printf("Terminal session ended normally")
				}
			}(job)
		} else if job.Type == "start_service" || job.Type == "stop_service" || job.Type == "restart_service" {
			go func(j *sentpulsev1.Job) {
				log.Printf("Executing service action: %s on %s", j.Type, j.Command)

				action := executor.ActionStart
				switch j.Type {
				case "stop_service":
					action = executor.ActionStop
				case "restart_service":
					action = executor.ActionRestart
				}

				err := executor.HandleServiceAction(context.Background(), j.Command, action)

				status := "success"
				result := fmt.Sprintf("Service action %s completed", j.Type)
				if err != nil {
					status = "failed"
					result = err.Error()
				}

				_, _ = a.Client.UpdateJobStatus(context.Background(), connect.NewRequest(&sentpulsev1.UpdateJobStatusRequest{
					JobId:  j.Id,
					Status: status,
					Result: result,
				}))
			}(job)
		} else if job.Type == "kill_process" {
			go func(j *sentpulsev1.Job) {
				log.Printf("Executing kill process: %s", j.Command)
				var pid int
				fmt.Sscanf(j.Command, "%d", &pid)

				err := executor.HandleKillProcess(context.Background(), pid)

				status := "success"
				result := "Process killed"
				if err != nil {
					status = "failed"
					result = err.Error()
				}

				_, _ = a.Client.UpdateJobStatus(context.Background(), connect.NewRequest(&sentpulsev1.UpdateJobStatusRequest{
					JobId:  j.Id,
					Status: status,
					Result: result,
				}))
			}(job)
		} else if job.Type == "install_patches" {
			go func(j *sentpulsev1.Job) {
				log.Printf("Executing patch installation: %s", j.Command)
				err := executor.HandleInstallPatches(context.Background(), j.Command)

				status := "success"
				result := "Patches installed successfully"
				if err != nil {
					status = "failed"
					result = err.Error()
				}

				_, _ = a.Client.UpdateJobStatus(context.Background(), connect.NewRequest(&sentpulsev1.UpdateJobStatusRequest{
					JobId:  j.Id,
					Status: status,
					Result: result,
				}))
			}(job)
		} else if job.Type == "shell" || job.Type == "powershell" || job.Type == "bash" {
			// Execute in background
			go func(j *sentpulsev1.Job) {
				log.Printf("Executing job %s (%s)", j.Id, j.Type)

				// Report Running
				_, _ = a.Client.UpdateJobStatus(context.Background(), connect.NewRequest(&sentpulsev1.UpdateJobStatusRequest{
					JobId:  j.Id,
					Status: "running",
				}))

				// Execute
				result, err := executor.Execute(context.Background(), j.Id, j.Command, j.Type)

				status := "success"
				exitCode := int32(0)
				output := ""

				if err != nil {
					log.Printf("Job %s execution failed: %v", j.Id, err)
					status = "failed"
					output = err.Error()
					exitCode = 1
				} else {
					exitCode = int32(result.ExitCode)
					output = result.Stdout
					if result.Stderr != "" {
						output += "\nSTDERR:\n" + result.Stderr
					}
					if exitCode != 0 {
						status = "failed"
					}
				}

				// Report Result
				_, err = a.Client.UpdateJobStatus(context.Background(), connect.NewRequest(&sentpulsev1.UpdateJobStatusRequest{
					JobId:    j.Id,
					Status:   status,
					Result:   output,
					ExitCode: exitCode,
				}))
				if err != nil {
					log.Printf("Failed to report job status for %s: %v", j.Id, err)
				} else {
					log.Printf("Job %s completed with status %s", j.Id, status)
				}

			}(job)
		} else if job.Type == "reboot" || job.Type == "shutdown" {
			go func(j *sentpulsev1.Job) {
				log.Printf("Executing power action: %s", j.Type)

				action := executor.ActionReboot
				if j.Type == "shutdown" {
					action = executor.ActionShutdown
				}

				// SAFETY: Set dryRun to true per user instructions
				err := executor.HandlePowerAction(context.Background(), action, true)

				status := "success"
				result := "Power action logged (Dry Run)"
				if err != nil {
					status = "failed"
					result = err.Error()
				}

				_, _ = a.Client.UpdateJobStatus(context.Background(), connect.NewRequest(&sentpulsev1.UpdateJobStatusRequest{
					JobId:  j.Id,
					Status: status,
					Result: result,
				}))
			}(job)
		} else if job.Type == "start_file_explorer" {
			go func(j *sentpulsev1.Job) {
				log.Printf("Starting file explorer session via job %s", j.Id)
				if a.ID == "" {
					log.Printf("Cannot start file explorer: Agent ID not set (pending check-in response)")
					return
				}
				if err := executor.HandleFileExplorer(context.Background(), a.Client, a.ID); err != nil {
					log.Printf("File Explorer session ended with error: %v", err)
				} else {
					log.Printf("File Explorer session ended normally")
				}
			}(job)
		}
	}

	return nil
}

func mapOS(osStr string) sentpulsev1.OS {
	switch osStr {
	case "windows", "Windows":
		return sentpulsev1.OS_OS_WINDOWS
	case "linux", "Linux", "ubuntu", "debian", "centos":
		return sentpulsev1.OS_OS_LINUX
	case "darwin", "macos", "macOS":
		return sentpulsev1.OS_OS_MACOS
	default:
		return sentpulsev1.OS_OS_UNSPECIFIED
	}
}
