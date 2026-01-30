package optic

import (
	"context"
	"fmt"
	"sent/ent"
	"sent/ent/camera"
	"sent/ent/tenant"
	"sent/pkg/auth"
	"sync"
)

// OpticBridge handles surveillance operations and WebRTC signaling.
type OpticBridge struct {
	ctx   context.Context
	db    *ent.Client
	auth  *auth.AuthBridge
	mu    sync.RWMutex
	// activeConnections map[int]*PeerConnection
}

// NewOpticBridge initializes the surveillance bridge.
func NewOpticBridge(db *ent.Client, auth *auth.AuthBridge) *OpticBridge {
	return &OpticBridge{
		db:   db,
		auth: auth,
	}
}

// Startup initializes the bridge context.
func (b *OpticBridge) Startup(ctx context.Context) {
	b.ctx = ctx
}

// GetCameras retrieves the list of configured cameras.
func (b *OpticBridge) GetCameras() ([]CameraDTO, error) {
	profile, err := b.auth.GetUserProfile()
	if err != nil {
		return nil, err
	}
	tenantID := profile.TenantID

	cameras, err := b.db.Camera.Query().
		Where(camera.HasTenantWith(tenant.ID(tenantID))).
		All(b.ctx)
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
	c, err := b.db.Camera.Get(b.ctx, cameraID)
	if err != nil {
		return err
	}

	client := &ONVIFClient{
		Endpoint: fmt.Sprintf("http://%s/onvif/ptz_service", c.IPAddress),
		Username: "admin", // Default for simulation
		Password: "admin",
	}

	var x, y float64
	switch direction {
	case "up":
		y = speed
	case "down":
		y = -speed
	case "left":
		x = -speed
	case "right":
		x = speed
	case "stop":
		return client.Stop()
	}

	return client.ContinuousMove(x, y, 0)
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
