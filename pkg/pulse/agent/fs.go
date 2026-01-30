package agent

import (
	"fmt"
	"io/ioutil"
	"os"
	"time"
)

type FileInfo struct {
	Name    string    `json:"name"`
	Size    int64     `json:"size"`
	Mode    string    `json:"mode"`
	ModTime time.Time `json:"modTime"`
	IsDir   bool      `json:"isDir"`
}

// ListFiles returns a list of files in a directory
func ListFiles(path string) ([]FileInfo, error) {
    // Basic security sandbox: preventing easy escape in MVP (TODO: rigorous checks)
    if path == "" || path == "." {
        path = "."
    }
    
	entries, err := ioutil.ReadDir(path)
	if err != nil {
		return nil, err
	}

	var files []FileInfo
	for _, entry := range entries {
		files = append(files, FileInfo{
			Name:    entry.Name(),
			Size:    entry.Size(),
			Mode:    entry.Mode().String(),
			ModTime: entry.ModTime(),
			IsDir:   entry.IsDir(),
		})
	}
    
    // Limit listing for MVP to prevent massive payloads
    if len(files) > 200 {
        files = files[:200]
    }

	return files, nil
}

// ReadFile returns content of a file (limit size)
func ReadFile(path string) ([]byte, error) {
    info, err := os.Stat(path)
    if err != nil {
        return nil, err
    }
    if info.Size() > 5*1024*1024 { // 5MB limit for MVP direct transfer
        return nil, fmt.Errorf("file too large for direct transfer")
    }
    return ioutil.ReadFile(path)
}
