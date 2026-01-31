package ai

import (
	"strings"
)

// ClassificationResult represents the output of document classification.
type ClassificationResult struct {
	FileType   string
	Confidence float64
	Keywords   []string
}

// ClassifyDocument performs keyword-based document classification.
// This is a simple rule-based classifier for MVP. Future versions can use ML.
func ClassifyDocument(content string) ClassificationResult {
	lowerContent := strings.ToLower(content)

	// Invoice Detection
	invoiceKeywords := []string{"invoice", "total due", "amount due", "bill to", "payment terms", "invoice number"}
	if matchKeywords(lowerContent, invoiceKeywords, 2) {
		return ClassificationResult{
			FileType:   "Invoice",
			Confidence: 0.85,
			Keywords:   invoiceKeywords,
		}
	}

	// Contract Detection
	contractKeywords := []string{"agreement", "party", "whereas", "hereby", "terms and conditions", "signature"}
	if matchKeywords(lowerContent, contractKeywords, 2) {
		return ClassificationResult{
			FileType:   "Contract",
			Confidence: 0.80,
			Keywords:   contractKeywords,
		}
	}

	// Resume/CV Detection
	resumeKeywords := []string{"experience", "education", "skills", "references", "curriculum vitae", "objective"}
	if matchKeywords(lowerContent, resumeKeywords, 3) {
		return ClassificationResult{
			FileType:   "Resume",
			Confidence: 0.75,
			Keywords:   resumeKeywords,
		}
	}

	// Report Detection
	reportKeywords := []string{"executive summary", "findings", "conclusion", "recommendations", "analysis"}
	if matchKeywords(lowerContent, reportKeywords, 2) {
		return ClassificationResult{
			FileType:   "Report",
			Confidence: 0.70,
			Keywords:   reportKeywords,
		}
	}

	// Receipt Detection
	receiptKeywords := []string{"receipt", "thank you for your purchase", "transaction", "subtotal", "tax"}
	if matchKeywords(lowerContent, receiptKeywords, 2) {
		return ClassificationResult{
			FileType:   "Receipt",
			Confidence: 0.75,
			Keywords:   receiptKeywords,
		}
	}

	// Letter Detection
	letterKeywords := []string{"dear", "sincerely", "regards", "to whom it may concern"}
	if matchKeywords(lowerContent, letterKeywords, 2) {
		return ClassificationResult{
			FileType:   "Letter",
			Confidence: 0.65,
			Keywords:   letterKeywords,
		}
	}

	// Default: Unknown
	return ClassificationResult{
		FileType:   "Document",
		Confidence: 0.50,
		Keywords:   nil,
	}
}

// matchKeywords checks if the content contains at least 'minMatches' of the keywords.
func matchKeywords(content string, keywords []string, minMatches int) bool {
	matches := 0
	for _, kw := range keywords {
		if strings.Contains(content, kw) {
			matches++
			if matches >= minMatches {
				return true
			}
		}
	}
	return false
}
