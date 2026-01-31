package security

import (
	"fmt"

	"os"
	"time"

	"github.com/pdfcpu/pdfcpu/pkg/api"

	"github.com/pdfcpu/pdfcpu/pkg/pdfcpu/types"
)

// WatermarkConfig holds the configuration for the watermark.
type WatermarkConfig struct {
	ViewerEmail string
	ViewerIP    string
	Timestamp   time.Time
}

// AddWatermark applies a dynamic text watermark to a PDF stream.
// It returns a byte slice of the watermarked PDF.
func AddWatermark(inputPath string, config WatermarkConfig) ([]byte, error) {
	// 1. Construct the watermark text
	text := fmt.Sprintf("CONFIDENTIAL VIEW\nUser: %s\nIP: %s\nTime: %s",
		config.ViewerEmail,
		config.ViewerIP,
		config.Timestamp.Format(time.RFC3339),
	)

	// 2. Configure the watermark description
	// "d" = diagonal, "op" = opacity, "c" = color (0.5 gray), "s" = font size
	desc := fmt.Sprintf("text:%s, points:12, pos:c, rot:45, op:0.3, col:0.5 0.5 0.5", text)

	// 3. Create a temporary output file (pdfcpu API primarily works with files/writers)
	// We can use a pipe or buffer if we dig deeper into pdfcpu, but temp file is safer for now.
	outFile, err := os.CreateTemp("", "watermarked-*.pdf")
	if err != nil {
		return nil, fmt.Errorf("failed to create temp file: %w", err)
	}
	defer os.Remove(outFile.Name())
	outFile.Close()

	// 4. Apply Watermark
	// We use the OnTop=true to ensure it's visible over images
	wmConf, err := api.TextWatermark(text, desc, true, false, types.POINTS)
	if err != nil {
		return nil, fmt.Errorf("invalid watermark config: %w", err)
	}

	if err := api.AddWatermarksFile(inputPath, outFile.Name(), nil, wmConf, nil); err != nil {
		return nil, fmt.Errorf("failed to apply watermark: %w", err)
	}

	// 5. Read back the result
	watermarkedBytes, err := os.ReadFile(outFile.Name())
	if err != nil {
		return nil, fmt.Errorf("failed to read back watermarked file: %w", err)
	}

	return watermarkedBytes, nil
}
