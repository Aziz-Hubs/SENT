package update

import (
	"context"
	"fmt"
	"net/http"

	"github.com/minio/selfupdate"
)

// UpdaterBridge handles application self-updates.
type UpdaterBridge struct {
	ctx context.Context
}

// NewUpdaterBridge initializes a new UpdaterBridge.
func NewUpdaterBridge() *UpdaterBridge {
	return &UpdaterBridge{}
}

// Startup initializes the bridge context.
func (u *UpdaterBridge) Startup(ctx context.Context) {
	u.ctx = ctx
}

// CheckForUpdate checks if a new version is available.
// Currently simulates a check.
//
// @returns available - True if update exists.
// @returns version - The new version string.
// @returns error - Any error during check.
func (u *UpdaterBridge) CheckForUpdate() (bool, string, error) {
	// TODO: Connect to a release server (e.g., GitHub Releases or custom API).
	// Example: Fetch 'https://updates.sent.jo/latest.json'
	
	// For MVP, we return false to disable auto-updates during development.
	return false, "1.0.0", nil
}

// ApplyUpdate downloads and applies the new binary from the given URL.
//
// Security Warning: In production, this MUST verify the binary signature (checksum/PGP)
// before applying to prevent supply chain attacks.
//
// @param url - The URL to the new binary.
func (u *UpdaterBridge) ApplyUpdate(url string) error {
	resp, err := http.Get(url)
	if err != nil {
		return fmt.Errorf("failed to download update: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("bad status during update download: %s", resp.Status)
	}

	// TODO: Calculate SHA256 of resp.Body and compare with expected checksum BEFORE applying.

	err = selfupdate.Apply(resp.Body, selfupdate.Options{})
	if err != nil {
		return fmt.Errorf("failed to apply update: %w", err)
	}

	return nil
}
