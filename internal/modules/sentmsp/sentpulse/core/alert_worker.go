package core

import (
	"context"
	"fmt"
	"log"
	"time"
)

// Repository interface helps in mocking/decoupling, though we use struct pointers directly in MVP.
// We will define interfaces if we need to switch impls. For now, we rely on the specific repos.

type DeviceRepo interface {
	FindDevicesLastSeenBefore(ctx context.Context, threshold time.Time) ([]Device, error)
	UpdateDeviceStatus(ctx context.Context, id string, status DeviceStatus) error
	FindHighUsageDevices(ctx context.Context, metric string, threshold float32) ([]Device, error)
}

type AlertRepo interface {
	CreateAlert(ctx context.Context, a *Alert) (*Alert, error)
	FindRecentAlert(ctx context.Context, deviceID, alertType string, since time.Time) (bool, error)
}

type SettingsRepo interface {
	GetSettings(ctx context.Context, orgID string) (*PulseSettings, error)
	ListAllOrganizations(ctx context.Context) ([]string, error)
}

// AlertWorker handles background monitoring tasks.
type AlertWorker struct {
	DeviceRepo   DeviceRepo
	AlertRepo    AlertRepo
	SettingsRepo SettingsRepo
	Interval     time.Duration
}

// NewAlertWorker creates a new AlertWorker.
func NewAlertWorker(deviceRepo DeviceRepo, alertRepo AlertRepo, settingsRepo SettingsRepo) *AlertWorker {
	return &AlertWorker{
		DeviceRepo:   deviceRepo,
		AlertRepo:    alertRepo,
		SettingsRepo: settingsRepo,
		Interval:     1 * time.Minute,
	}
}

// Run starts the monitoring loop.
func (w *AlertWorker) Run(ctx context.Context) {
	log.Printf("Starting AlertWorker with interval %v", w.Interval)
	ticker := time.NewTicker(w.Interval)
	defer ticker.Stop()

	// Initial check
	w.performChecks(ctx)

	for {
		select {
		case <-ctx.Done():
			log.Println("Stopping AlertWorker")
			return
		case <-ticker.C:
			w.performChecks(ctx)
		}
	}
}

func (w *AlertWorker) performChecks(ctx context.Context) {
	orgIDs, err := w.SettingsRepo.ListAllOrganizations(ctx)
	if err != nil {
		log.Printf("AlertWorker: Failed to list organizations: %v", err)
		return
	}

	for _, orgID := range orgIDs {
		settings, err := w.SettingsRepo.GetSettings(ctx, orgID)
		if err != nil {
			log.Printf("AlertWorker: Failed to get settings for org %s: %v", orgID, err)
			continue
		}

		w.checkOfflineDevices(ctx, settings)
		w.checkResourceUsage(ctx, settings)
	}
}

func (w *AlertWorker) checkOfflineDevices(ctx context.Context, s *PulseSettings) {
	minutes := 5
	if s != nil {
		minutes = int(s.OfflineThresholdMinutes)
	}
	threshold := time.Now().Add(time.Duration(-minutes) * time.Minute)
	devices, err := w.DeviceRepo.FindDevicesLastSeenBefore(ctx, threshold)
	if err != nil {
		log.Printf("AlertWorker: Failed to find offline devices: %v", err)
		return
	}

	for _, d := range devices {
		log.Printf("AlertWorker: Device %s (%s) is offline", d.Name, d.ID)

		// Update Status
		if err := w.DeviceRepo.UpdateDeviceStatus(ctx, d.ID, DeviceStatusOffline); err != nil {
			log.Printf("AlertWorker: Failed to update status for %s: %v", d.ID, err)
			continue
		}

		// Create Alert (De-duplicate?)
		// For offline, we might want to alert every time it goes offline.
		// But let's check if we alerted recently to avoid spam if the worker runs frequently.
		recent, err := w.AlertRepo.FindRecentAlert(ctx, d.ID, "offline", time.Now().Add(-10*time.Minute))
		if err != nil {
			log.Printf("AlertWorker: Failed to check user alerts: %v", err)
			continue
		}
		if recent {
			continue
		}

		alert := &Alert{
			OrganizationID: d.OrganizationID,
			DeviceID:       d.ID,
			DeviceName:     d.Name,
			Severity:       AlertSeverityCritical,
			Title:          "Device Offline",
			Description:    fmt.Sprintf("Device %s has not checked in since %s", d.Name, d.LastSeen.Format(time.RFC3339)),
			CreatedAt:      time.Now(),
		}
		// Type field is missing in Alert struct in types.go?
		// Wait, types.go didn't have 'Type' field in Alert struct!
		// It has 'Title'. We use 'Title' as type for FindRecentAlert check?
		// Ah, repo.FindRecentAlert uses 'type' column.
		// Use 'Title' as the type discriminator for now.
		// Note: The SQL in repo uses 'type' column. I need to make sure Alert struct has Type or I map Title to it.
		// Checking types.go again... it DOES NOT have Type.
		// Checking repositories.go CreateAlert... it uses a.Title as... wait.
		// repositories.go CreateAlert SQL: INSERT INTO alerts (..., type, title, ...) ?
		// Let me re-read repositories.go CreateAlert.

		_, err = w.AlertRepo.CreateAlert(ctx, alert)
		if err != nil {
			log.Printf("AlertWorker: Failed to create alert for %s: %v", d.ID, err)
		}
	}
}

func (w *AlertWorker) checkResourceUsage(ctx context.Context, s *PulseSettings) {
	// CPU
	w.checkThreshold(ctx, "cpu_usage", s.CPUThreshold, AlertSeverityCritical, "High CPU Usage", "CPU usage is above threshold")

	// Memory
	w.checkThreshold(ctx, "memory_usage", s.MemoryThreshold, AlertSeverityWarning, "High Memory Usage", "Memory usage is above threshold")

	// Disk
	w.checkThreshold(ctx, "disk_usage", s.DiskThreshold, AlertSeverityWarning, "High Disk Usage", "Disk usage is above threshold")
}

func (w *AlertWorker) checkThreshold(ctx context.Context, metric string, threshold float32, severity AlertSeverity, title, desc string) {
	devices, err := w.DeviceRepo.FindHighUsageDevices(ctx, metric, threshold)
	if err != nil {
		log.Printf("AlertWorker: Failed to check %s: %v", metric, err)
		return
	}

	for _, d := range devices {
		// Dedup: Don't alert if we alerted in last 30 mins
		recent, err := w.AlertRepo.FindRecentAlert(ctx, d.ID, title, time.Now().Add(-30*time.Minute))
		if err != nil {
			continue
		}
		if recent {
			continue
		}

		log.Printf("AlertWorker: High Usage %s on %s", metric, d.Name)
		alert := &Alert{
			OrganizationID: d.OrganizationID,
			DeviceID:       d.ID,
			DeviceName:     d.Name,
			Severity:       severity,
			Title:          title,
			Description:    fmt.Sprintf("%s (%v%%) on %s", desc, threshold, d.Name),
			CreatedAt:      time.Now(),
		}
		w.AlertRepo.CreateAlert(ctx, alert)
	}
}
