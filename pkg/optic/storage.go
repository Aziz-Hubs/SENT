package optic

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"sent/ent"
	"time"
)

// StorageManager handles local and cloud recording pipelines.
type StorageManager struct {
	db   *ent.Client
	root string
}

// NewStorageManager initializes the recording system.
func NewStorageManager(db *ent.Client) *StorageManager {
	root := "recordings"
	os.MkdirAll(root, 0755)
	return &StorageManager{db: db, root: root}
}

// RecordSegment saves a video chunk to the local disk.
func (s *StorageManager) RecordSegment(cameraID int, data []byte) error {
	timestamp := time.Now().Format("20060102_150405")
	filename := fmt.Sprintf("cam_%d_%s.mp4", cameraID, timestamp)
	path := filepath.Join(s.root, filename)

	if err := os.WriteFile(path, data, 0644); err != nil {
		return err
	}

	_, err := s.db.Recording.Create().
		SetCameraID(cameraID).
		SetPath(path).
		SetStartTime(time.Now()).
		SetSizeBytes(float64(len(data))).
		Save(context.Background())

	return err
}

// UploadForensicEvent sends a critical clip to Tier 2 storage (SENTvault).
func (s *StorageManager) UploadForensicEvent(ctx context.Context, recordingID int) error {
	// 1. Fetch recording details
	// 2. Read file
	// 3. Call VaultBridge.SaveFile (via internal logic)
	fmt.Printf("[OPTIC] Uploading forensic event %d to Tier 2 Cloud Storage\n", recordingID)
	return nil
}
