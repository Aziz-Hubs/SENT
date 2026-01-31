//go:build windows

package vault

import "log"

type StubOCREngine struct{}

func (e *StubOCREngine) ExtractText(imagePath string) (string, error) {
	log.Printf("[OCR] Windows OCR Stub: Skipping extraction for %s", imagePath)
	return "", nil
}

func init() {
	currentOCREngine = &StubOCREngine{}
}
