package optic

import (
	"context"
	"embed"
	"fmt"
	"math/rand"
	"sent/ent"
	"time"
)

//go:embed assets/model.tflite
var opticAssets embed.FS

// InferenceEngine handles object detection simulations.
// Note: This is a foundational stub for the TFLite worker.
type InferenceEngine struct {
	db *ent.Client
}

// NewInferenceEngine initializes the detection engine.
func NewInferenceEngine(db *ent.Client) (*InferenceEngine, error) {
	if _, err := opticAssets.ReadFile("assets/model.tflite"); err != nil {
		return nil, fmt.Errorf("failed to verify embedded model: %w", err)
	}

	return &InferenceEngine{db: db}, nil
}

// ProcessStream runs inference simulation on a camera stream.
func (e *InferenceEngine) ProcessStream(ctx context.Context, cameraID int) {
	ticker := time.NewTicker(2 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			if rand.Float64() > 0.7 {
				label := "person"
				if rand.Float64() > 0.5 {
					label = "vehicle"
				}

				confidence := 0.85 + rand.Float64()*0.1
				box := map[string]float64{
					"x": rand.Float64() * 0.5,
					"y": rand.Float64() * 0.5,
					"w": 0.2,
					"h": 0.3,
				}

				_, err := e.db.DetectionEvent.Create().
					SetCameraID(cameraID).
					SetLabel(label).
					SetConfidence(confidence).
					SetBox(box).
					Save(ctx)
				
				if err == nil {
					fmt.Printf("[OPTIC] AI Detection: %s (%.2f) on camera %d\n", label, confidence, cameraID)
				}
			}
		}
	}
}
