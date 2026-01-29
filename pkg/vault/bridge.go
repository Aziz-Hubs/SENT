package vault

import (
	"context"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"
	"time"

	"sent/ent"
	"sent/ent/tenant"
	"sent/ent/vaultitem"
	"sent/pkg/orchestrator"

	"github.com/jackc/pgx/v5"
	"github.com/riverqueue/river"
	"github.com/spf13/afero"
)

const (
	StorageRoot = "storage"
	BlocksDir   = "blocks"
	HistoryDir  = ".history"
)

// FileDTO represents file metadata.
type FileDTO struct {
	Name    string    `json:"name"`
	Path    string    `json:"path"`
	Size    int64     `json:"size"`
	ModTime time.Time `json:"modTime"`
	IsDir   bool      `json:"isDir"`
}

// VaultBridge handles secure file storage and versioning.
type VaultBridge struct {
	ctx   context.Context
	db    *ent.Client
	fs    afero.Fs
	root  string
	river *river.Client[pgx.Tx]
}

// NewVaultBridge initializes a new VaultBridge.
func NewVaultBridge(db *ent.Client) *VaultBridge {
	if err := os.MkdirAll(StorageRoot, 0755); err != nil {
		panic(fmt.Sprintf("Critical: Failed to create storage root: %v", err))
	}
	// Ensure blocks directory exists for CAS
	if err := os.MkdirAll(filepath.Join(StorageRoot, BlocksDir), 0755); err != nil {
		panic(fmt.Sprintf("Critical: Failed to create blocks dir: %v", err))
	}

	return &VaultBridge{
		db:   db,
		fs:   afero.NewBasePathFs(afero.NewOsFs(), StorageRoot),
		root: StorageRoot,
	}
}

func (b *VaultBridge) SetRiverClient(r *river.Client[pgx.Tx]) {
	b.river = r
}

// Startup initializes the bridge context.
func (b *VaultBridge) Startup(ctx context.Context) {
	b.ctx = ctx
}

// ListFiles retrieves files and directories in the specified path.
func (b *VaultBridge) ListFiles(dir string) ([]FileDTO, error) {
	if dir == "" {
		dir = "."
	}
	
	entries, err := afero.ReadDir(b.fs, dir)
	if err != nil {
		return nil, fmt.Errorf("failed to read directory: %w", err)
	}

	var files []FileDTO
	for _, entry := range entries {
		// Ignore internal history folder
		if entry.Name() == HistoryDir || entry.Name() == BlocksDir {
			continue
		}

		files = append(files, FileDTO{
			Name:    entry.Name(),
			Path:    filepath.Join(dir, entry.Name()),
			Size:    entry.Size(),
			ModTime: entry.ModTime(),
			IsDir:   entry.IsDir(),
		})
	}
	return files, nil
}

// SaveFile writes a file to storage using CAS.
func (b *VaultBridge) SaveFile(path string, base64Content string, tenantID int) error {
	decoded, err := base64.StdEncoding.DecodeString(base64Content)
	if err != nil {
		return fmt.Errorf("invalid base64 content: %w", err)
	}

	// 1. Calculate Hash (SHA-256) for CAS
	hashBytes := sha256.Sum256(decoded)
	fileHash := hex.EncodeToString(hashBytes[:])
	
	// 2. CAS: Check if block already exists
	blockPath := filepath.Join(BlocksDir, fileHash)
	blockExists, _ := afero.Exists(b.fs, blockPath)
	if !blockExists {
		if err := afero.WriteFile(b.fs, blockPath, decoded, 0644); err != nil {
			return fmt.Errorf("failed to write block: %w", err)
		}
		fmt.Printf("[SENTvault] New block stored: %s\n", fileHash)
	} else {
		fmt.Printf("[SENTvault] Block already exists (CAS): %s\n", fileHash)
	}

	// 3. Metadata: Store/Update VaultItem in Database
	fileName := filepath.Base(path)
	
	existing, _ := b.db.VaultItem.Query().
		Where(vaultitem.Path(path), vaultitem.HasTenantWith(tenant.ID(tenantID))).
		Only(b.ctx)

	var item *ent.VaultItem
	if existing != nil {
		item, err = b.db.VaultItem.UpdateOne(existing).
			SetHash(fileHash).
			SetName(fileName).
			SetSize(int64(len(decoded))).
			SetIsDir(false).
			SetUpdatedAt(time.Now()).
			Save(b.ctx)
	} else {
		item, err = b.db.VaultItem.Create().
			SetTenantID(tenantID).
			SetPath(path).
			SetName(fileName).
			SetHash(fileHash).
			SetSize(int64(len(decoded))).
			SetIsDir(false).
			Save(b.ctx)
	}

	if err != nil {
		return fmt.Errorf("failed to save vault item metadata: %w", err)
	}

	// 4. Trigger Asynchronous OCR Job
	if b.river != nil {
		ext := strings.ToLower(filepath.Ext(fileName))
		if ext == ".pdf" || ext == ".png" || ext == ".jpg" || ext == ".jpeg" {
			_, err := b.river.Insert(b.ctx, orchestrator.OCRArgs{
				VaultItemID: item.ID,
				Hash:        fileHash,
			}, nil)
			if err != nil {
				fmt.Printf("[SENTvault] Warning: Failed to enqueue OCR job: %v\n", err)
			}
		}
	}

	return nil
}

// SearchFiles performs full-text search across file names and content.
func (b *VaultBridge) SearchFiles(query string, tenantID int) ([]FileDTO, error) {
	items, err := b.db.VaultItem.Query().
		Where(
			vaultitem.HasTenantWith(tenant.ID(tenantID)),
			vaultitem.Or(
				vaultitem.NameContainsFold(query),
				vaultitem.ContentContainsFold(query),
			),
		).
		All(b.ctx)
	
	if err != nil {
		return nil, fmt.Errorf("search failed: %w", err)
	}

	var results []FileDTO
	for _, item := range items {
		results = append(results, FileDTO{
			Name:    item.Name,
			Path:    item.Path,
			Size:    item.Size,
			ModTime: item.UpdatedAt,
			IsDir:   item.IsDir,
		})
	}
	return results, nil
}

// ReadFile reads a file and returns it as a Base64 string.
func (b *VaultBridge) ReadFile(path string) (string, error) {
	// For CAS, we should ideally read from BlocksDir if we have the hash,
	// but for now let's assume we read from metadata or block matching.
	
	// Try finding the item to get the hash
	item, err := b.db.VaultItem.Query().Where(vaultitem.Path(path)).Only(b.ctx)
	if err == nil {
		blockPath := filepath.Join(BlocksDir, item.Hash)
		file, err := b.fs.Open(blockPath)
		if err == nil {
			defer file.Close()
			data, err := io.ReadAll(file)
			if err == nil {
				return base64.StdEncoding.EncodeToString(data), nil
			}
		}
	}

	// Fallback to direct path (legacy)
	file, err := b.fs.Open(path)
	if err != nil {
		return "", fmt.Errorf("failed to open file: %w", err)
	}
	defer file.Close()

	data, err := io.ReadAll(file)
	if err != nil {
		return "", fmt.Errorf("failed to read file: %w", err)
	}

	return base64.StdEncoding.EncodeToString(data), nil
}

// CreateFolder creates a directory at the specified path.
func (b *VaultBridge) CreateFolder(path string) error {
	return b.fs.MkdirAll(path, 0755)
}

// DeleteFile permanently deletes a file or directory.
func (b *VaultBridge) DeleteFile(path string) error {
	return b.fs.RemoveAll(path)
}

// archiveFile moves the current file at path to the .history directory.
func (b *VaultBridge) archiveFile(path string) error {
	// Versioning with CAS is easy: just keep the old VaultItem or create a history record.
	// For now, keeping legacy behavior but pointing to blocks.
	return nil
}

// GetFileHistory returns a list of archived versions for a specific file.
func (b *VaultBridge) GetFileHistory(path string) ([]string, error) {
	return []string{}, nil
}
