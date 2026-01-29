package recording

import (
	"fmt"
	"os"
	"path/filepath"
	"sync"

	"github.com/pion/rtp"
	"github.com/spf13/afero"
)

// Recorder captures RTP streams to storage.
type Recorder struct {
	fs   afero.Fs
	mu   sync.Mutex
	file afero.File
	path string
}

// NewRecorder initializes a new Recorder.
func NewRecorder(fs afero.Fs, filename string) (*Recorder, error) {
	path := filepath.Join("recordings", filename)
	
	// Ensure directory exists
	if err := fs.MkdirAll("recordings", 0755); err != nil {
		return nil, err
	}

	f, err := fs.Create(path)
	if err != nil {
		return nil, fmt.Errorf("failed to create recording file: %w", err)
	}

	return &Recorder{
		fs:   fs,
		file: f,
		path: path,
	}, nil
}

// WriteRTP writes a packet's payload to the file.
func (r *Recorder) WriteRTP(p *rtp.Packet) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	if r.file == nil {
		return os.ErrClosed
	}

	_, err := r.file.Write(p.Payload)
	return err
}

// Close finishes the recording.
func (r *Recorder) Close() error {
	r.mu.Lock()
	defer r.mu.Unlock()

	if r.file == nil {
		return nil
	}

	err := r.file.Close()
	r.file = nil
	return err
}
