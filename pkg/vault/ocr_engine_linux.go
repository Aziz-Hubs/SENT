//go:build linux

package vault

import (
	"fmt"
	"github.com/otiai10/gosseract/v2"
)

type TesseractEngine struct{}

func (e *TesseractEngine) ExtractText(imagePath string) (string, error) {
	client := gosseract.NewClient()
	defer client.Close()

	if err := client.SetImage(imagePath); err != nil {
		return "", fmt.Errorf("failed to set image: %w", err)
	}

	return client.Text()
}

func init() {
	currentOCREngine = &TesseractEngine{}
}
