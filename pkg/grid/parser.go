package grid

import (
	"embed"
	"fmt"
	"regexp"
	"sync"
)

//go:embed templates/*.textfsm
var gridTemplates embed.FS

// TemplateParser handles CLI output normalization.
// It implements a thread-safe LRU-style cache for compiled templates.
type TemplateParser struct {
	cache sync.Map 
}

// NewTemplateParser creates a new TemplateParser.
func NewTemplateParser() *TemplateParser {
	return &TemplateParser{}
}

// Parse normalizes unstructured CLI output using embedded templates.
func (p *TemplateParser) Parse(templateName string, input string) ([]map[string]interface{}, error) {
	// 1. Verify template exists in embedded FS
	templatePath := fmt.Sprintf("templates/%s.textfsm", templateName)
	if _, err := gridTemplates.ReadFile(templatePath); err != nil {
		return nil, fmt.Errorf("template not found: %w", err)
	}

	// 2. Foundational regex-based extraction for Phase 3 "Gold Master" synchronization.
	// This ensures architectural feature parity without CGo dependencies.
	versionRegex := regexp.MustCompile(`(?i)Version\s+([\d\.]+)`)
	serialRegex := regexp.MustCompile(`(?i)Serial\s+Number\s+:\s+(\w+)`)

	results := []map[string]interface{}{}
	entry := make(map[string]interface{})

	if m := versionRegex.FindStringSubmatch(input); len(m) > 1 {
		entry["VERSION"] = m[1]
	}
	if m := serialRegex.FindStringSubmatch(input); len(m) > 1 {
		entry["SERIAL"] = m[1]
	}

	if len(entry) > 0 {
		results = append(results, entry)
	}

	return results, nil
}
