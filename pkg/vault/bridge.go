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
	"sent/pkg/auth"
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
	auth  *auth.AuthBridge
}

// NewVaultBridge initializes a new VaultBridge.
func NewVaultBridge(db *ent.Client, auth *auth.AuthBridge) *VaultBridge {
	if err := os.MkdirAll(StorageRoot, 0755); err != nil {
		panic(fmt.Sprintf("Critical: Failed to create storage root: %v", err))
	}
	// Ensure blocks directory exists for CAS
	if err := os.MkdirAll(filepath.Join(StorageRoot, BlocksDir), 0755); err != nil {
		panic(fmt.Sprintf("Critical: Failed to create blocks dir: %v", err))
	}

	return &VaultBridge{
		db:   db,
		auth: auth,
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

// getTenantFS returns a base-path filesystem isolated to the specific tenant.
func (b *VaultBridge) getTenantFS(tenantID int) afero.Fs {
	tenantPath := fmt.Sprintf("tenant_%d", tenantID)
	// We don't MkdirAll here as afero.BasePathFs doesn't create the base path automatically
	// on every operation, but NewBasePathFs assumes it exists if you want to write to it.
	// Actually, OsFs will create it if we use MkdirAll on it.
	fullPath := filepath.Join(b.root, tenantPath)
	os.MkdirAll(fullPath, 0755)
	return afero.NewBasePathFs(afero.NewOsFs(), fullPath)
}

// sanitizePath ensures the path is clean and doesn't contain traversal segments or illegal characters.
// This prevents both path traversal attacks (S3) and crashes from special characters (F1).
func (b *VaultBridge) sanitizePath(path string) (string, error) {
	// Early validation: reject empty paths
	if path == "" {
		return ".", nil
	}
	
	// First pass: resolve any .. segments and normalize
	// Note: Clean() on a relative path stays relative, but "/.." becomes "/"
	cleaned := filepath.Clean(path)
	
	// Security Check: Absolute paths and UNC paths are strictly forbidden.
	// We check for both Unix and Windows absolute path patterns to be cross-platform secure.
	isWindowsAbs := len(path) >= 3 && (path[1] == ':' && (path[2] == '/' || path[2] == '\\'))
	if filepath.IsAbs(path) || filepath.IsAbs(cleaned) || strings.HasPrefix(path, "\\\\") || strings.HasPrefix(path, "//") || isWindowsAbs {
		return "", fmt.Errorf("absolute paths and UNC paths are not allowed")
	}

	// Critical Security Check: Ensure no ".." segments remain ANYWHERE in the path
	// This prevents attacks like: "safe/../../etc/passwd" -> "../etc/passwd"
	parts := strings.Split(cleaned, string(filepath.Separator))
	for _, part := range parts {
		if part == ".." {
			return "", fmt.Errorf("path traversal detected: '..' segments not allowed")
		}
	}
	
	// Ensure the path is relative and doesn't try to escape via root
	cleaned = strings.TrimPrefix(cleaned, string(filepath.Separator))
	if filepath.Separator == '\\' {
		cleaned = strings.TrimPrefix(cleaned, "/") 
	}
	cleaned = strings.TrimPrefix(cleaned, ".")
	cleaned = strings.TrimPrefix(cleaned, string(filepath.Separator))
	
	// Strict Character Sanitization: Replace unsafe filesystem characters
	// This prevents crashes on directory/file creation with special chars (F1)
	// Block: < > : " \ | ? * and control characters
	sanitized := strings.Map(func(r rune) rune {
		switch r {
		case '<', '>', ':', '"', '|', '?', '*', '\\':
			return '_'
		}
		// Block control characters (ASCII < 32) and DEL (127)
		if r < 32 || r == 127 {
			return '_'
		}
		// Block Unicode control characters
		if r >= 0x7F && r <= 0x9F {
			return '_'
		}
		return r
	}, cleaned)
	
	// Final validation: ensure the path doesn't escape the current directory
	// Even after cleaning, verify it doesn't start with ".."
	if strings.HasPrefix(sanitized, "..") {
		return "", fmt.Errorf("invalid path: cannot escape base directory")
	}
	
	// Normalize to "." if empty after sanitization
	if sanitized == "" {
		return ".", nil
	}
	
	return sanitized, nil
}

// ListFiles retrieves files and directories in the specified path.
func (b *VaultBridge) ListFiles(dir string) ([]FileDTO, error) {
	profile, err := b.auth.GetUserProfile()
	if err != nil {
		return nil, err
	}
	tenantID := profile.TenantID

	dir, err = b.sanitizePath(dir)
	if err != nil {
		return nil, fmt.Errorf("invalid path: %w", err)
	}
	fs := b.getTenantFS(tenantID)
	
	entries, err := afero.ReadDir(fs, dir)
	if err != nil {
		// If directory doesn't exist, return empty list instead of error for better UX
		if os.IsNotExist(err) {
			return []FileDTO{}, nil
		}
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
// SaveFile writes a file to storage using CAS.
func (b *VaultBridge) SaveFile(path string, base64Content string) error {
	profile, err := b.auth.GetUserProfile()
	if err != nil {
		return err
	}
	return b.SaveFileAsTenant(path, base64Content, profile.TenantID)
}

// SaveFileAsTenant writes a file to storage for a specific tenant using CAS.
func (b *VaultBridge) SaveFileAsTenant(path string, base64Content string, tenantID int) error {
	path, err := b.sanitizePath(path)
	if err != nil {
		return fmt.Errorf("invalid path: %w", err)
	}
	// Security Check: Limit file size to 50MB to prevent OOM
	if len(base64Content) > 70*1024*1024 { // Approx 50MB after base64
		return fmt.Errorf("file too large (max 50MB)")
	}

	decoded, err := base64.StdEncoding.DecodeString(base64Content)
	if err != nil {
		return fmt.Errorf("invalid base64 content: %w", err)
	}
	// Ensure secure disposal of the buffer after function exit
	defer func() {
		for i := range decoded {
			decoded[i] = 0
		}
	}()

	// 1. Calculate Hash (SHA-256) for CAS
	hashBytes := sha256.Sum256(decoded)
	fileHash := hex.EncodeToString(hashBytes[:])
	
	// 2. CAS: Check if block already exists in GLOBAL blocks dir
	globalFS := b.fs // This is the root StorageRoot FS
	blockPath := filepath.Join(BlocksDir, fileHash)
	blockExists, _ := afero.Exists(globalFS, blockPath)
	if !blockExists {
		if err := afero.WriteFile(globalFS, blockPath, decoded, 0644); err != nil {
			return fmt.Errorf("failed to write block: %w", err)
		}
		fmt.Printf("[SENTvault] New block stored: %s\n", fileHash)
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
func (b *VaultBridge) SearchFiles(query string) ([]FileDTO, error) {
	profile, err := b.auth.GetUserProfile()
	if err != nil {
		return nil, err
	}
	tenantID := profile.TenantID

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
	profile, err := b.auth.GetUserProfile()
	if err != nil {
		return "", err
	}
	tenantID := profile.TenantID

	path, err = b.sanitizePath(path)
	if err != nil {
		return "", fmt.Errorf("invalid path: %w", err)
	}
	
	// Try finding the item to get the hash (restricted to tenant)
	item, err := b.db.VaultItem.Query().
		Where(vaultitem.Path(path), vaultitem.HasTenantWith(tenant.ID(tenantID))).
		Only(b.ctx)
		
	if err == nil {
		// Read from global blocks
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

	// Fallback to direct path in tenant isolated FS
	fs := b.getTenantFS(tenantID)
	file, err := fs.Open(path)
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
	profile, err := b.auth.GetUserProfile()
	if err != nil {
		return err
	}
	tenantID := profile.TenantID

	path, err = b.sanitizePath(path)
	if err != nil {
		return fmt.Errorf("invalid path: %w", err)
	}
	fs := b.getTenantFS(tenantID)
	return fs.MkdirAll(path, 0755)
}

// DeleteFile permanently deletes a file or directory.
func (b *VaultBridge) DeleteFile(path string) error {
	profile, err := b.auth.GetUserProfile()
	if err != nil {
		return err
	}
	tenantID := profile.TenantID

	if !b.auth.HasRole("admin") {
		return fmt.Errorf("permission denied: only admins can delete files")
	}
	path, err = b.sanitizePath(path)
	if err != nil {
		return fmt.Errorf("invalid path: %w", err)
	}
	fs := b.getTenantFS(tenantID)
	
	// Also delete metadata from DB
	_, _ = b.db.VaultItem.Delete().
		Where(vaultitem.Path(path), vaultitem.HasTenantWith(tenant.ID(tenantID))).
		Exec(b.ctx)
		
	return fs.RemoveAll(path)
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
