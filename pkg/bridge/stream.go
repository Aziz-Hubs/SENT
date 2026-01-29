package bridge

import (
	"context"
	"encoding/base64"
	"fmt"
	"io"
	"os"
)

// StreamBridge handles file streaming and data processing operations.
type StreamBridge struct {
	ctx context.Context
}

// NewStreamBridge creates a new instance of StreamBridge.
func NewStreamBridge() *StreamBridge {
	return &StreamBridge{}
}

// Startup initializes the bridge with the Wails application context.
func (s *StreamBridge) Startup(ctx context.Context) {
	s.ctx = ctx
}

// LoadLargeFile reads a file from the disk and returns it as a Base64 string.
//
// Safety: This function enforces a maximum file size limit (e.g., 50MB) to prevent memory exhaustion.
//
// @param path - The absolute path to the file.
// @returns The Base64 encoded file content or an error.
func (s *StreamBridge) LoadLargeFile(path string) (string, error) {
	const MaxFileSize = 50 * 1024 * 1024 // 50MB limit

	fileInfo, err := os.Stat(path)
	if err != nil {
		return "", fmt.Errorf("failed to stat file: %w", err)
	}

	if fileInfo.Size() > MaxFileSize {
		return "", fmt.Errorf("file exceeds maximum allowed size of %d bytes", MaxFileSize)
	}

	file, err := os.Open(path)
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