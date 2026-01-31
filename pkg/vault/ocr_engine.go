package vault



type OCREngine interface {
	ExtractText(imagePath string) (string, error)
}

var currentOCREngine OCREngine
