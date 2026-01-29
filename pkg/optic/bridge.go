package optic

import (
	"context"
	"fmt"
	"sent/ent"
	"sync"
)

// OpticBridge handles surveillance operations and WebRTC signaling.
type OpticBridge struct {
	ctx   context.Context
	db    *ent.Client
	mu    sync.RWMutex
	// activeConnections map[int]*PeerConnection
}

// NewOpticBridge initializes the surveillance bridge.
func NewOpticBridge(db *ent.Client) *OpticBridge {
	return &OpticBridge{
		db: db,
	}
}

// Startup initializes the bridge context.
func (b *OpticBridge) Startup(ctx context.Context) {
	b.ctx = ctx
}

// GetCameras retrieves the list of configured cameras.
func (b *OpticBridge) GetCameras() ([]CameraDTO, error) {
	cameras, err := b.db.Camera.Query().All(b.ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch cameras: %w", err)
	}

	dtos := make([]CameraDTO, len(cameras))
	for i, c := range cameras {
		dtos[i] = CameraDTO{
			ID:      c.ID,
			Name:    c.Name,
			RTSPURL: c.RtspURL,
			IP:      c.IPAddress,
		}
	}
	return dtos, nil
}

// PTZMove sends a PTZ command to the specified camera.
func (b *OpticBridge) PTZMove(cameraID int, direction string, speed float64) error {
	// Implementation will use ONVIF SOAP client
	fmt.Printf("[OPTIC] Moving camera %d in direction %s at speed %f\n", cameraID, direction, speed)
	return nil
}

// PTZClickToCenter centers the camera on the specified normalized coordinates.
func (b *OpticBridge) PTZClickToCenter(cameraID int, x, y float64) error {
	// Map normalized [0,1] to ONVIF [-1,1] or absolute coordinates
	fmt.Printf("[OPTIC] Centering camera %d on coordinates (%f, %f)\n", cameraID, x, y)
	return nil
}

// Connect initiates a WebRTC peer connection for the specified camera.
func (b *OpticBridge) Connect(cameraID int, offer string) (string, error) {
	fmt.Printf("[OPTIC] WebRTC: Processing offer for camera %d\n", cameraID)
	// In real implementation:
	// 1. Initialize Pion PeerConnection
	// 2. Add RTSP track from MediaMTX
	// 3. Return SDP Answer
	return "MOCK_SDP_ANSWER", nil
}

type CameraDTO struct {
	ID      int    `json:"id"`
	Name    string `json:"name"`
	RTSPURL string `json:"rtspUrl"`
	IP      string `json:"ip"`
}
