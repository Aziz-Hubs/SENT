package grid

import (
	"context"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"fmt"
	"sent/ent"
	"sent/ent/networkbackup"
	"sent/ent/networkdevice"
	"sent/pkg/grid/pool"
	"sent/pkg/vault"
	"time"
)

// ConfigManager handles configuration backups and drift detection.
type ConfigManager struct {
	db    *ent.Client
	pool  *pool.WorkerPool
	vault *vault.VaultBridge
}

// NewConfigManager initializes a configuration manager.
func NewConfigManager(db *ent.Client, pool *pool.WorkerPool, vault *vault.VaultBridge) *ConfigManager {
	return &ConfigManager{
		db:    db,
		pool:  pool,
		vault: vault,
	}
}

// BackupDevice takes a snapshot of a device configuration.
func (m *ConfigManager) BackupDevice(ctx context.Context, devID int) (string, error) {
	dev, err := m.db.NetworkDevice.Get(ctx, devID)
	if err != nil {
		return "", err
	}

	// 1. Fetch live config
	resChan := make(chan pool.Result, 1)
	m.pool.Submit(pool.Task{
		DeviceIP: dev.IPAddress,
		Command:  "show running-config",
		Vendor:   dev.Vendor,
		Result:   resChan,
	})

	res := <-resChan
	if res.Error != nil {
		return "", res.Error
	}

	// 2. Hash for CAS (Content-Addressable Storage)
	hash := sha256.Sum256([]byte(res.Output))
	contentHash := hex.EncodeToString(hash[:])

	// 3. Check for drift (last backup hash)
	lastBackup, _ := m.db.NetworkBackup.Query().
		Where(networkbackup.HasDeviceWith(networkdevice.ID(dev.ID))).
		Order(ent.Desc(networkbackup.FieldCreatedAt)).
		First(ctx)

	if lastBackup != nil && lastBackup.ContentHash == contentHash {
		return "No drift detected. Backup skipped.", nil
	}

	// 4. Store in Vault
	vaultPath := fmt.Sprintf("network_backups/%s/%d_%s.cfg", dev.Name, time.Now().Unix(), contentHash[:8])
	b64Config := base64.StdEncoding.EncodeToString([]byte(res.Output))
	
	tenantID := 1 // Default to 1 for now

	err = m.vault.SaveFileAsTenant(vaultPath, b64Config, tenantID)
	if err != nil {
		return "", fmt.Errorf("vault storage failed: %w", err)
	}

	// 5. Update DB
	_, err = m.db.NetworkBackup.Create().
		SetDevice(dev).
		SetContentHash(contentHash).
		SetVaultPath(vaultPath).
		Save(ctx)

	return fmt.Sprintf("Backup successful: %s", contentHash[:8]), err
}
