package vault

import (
	"testing"
)

// TestSanitizePath_PathTraversal tests that path traversal attacks are blocked (S3)
func TestSanitizePath_PathTraversal(t *testing.T) {
	b := &VaultBridge{}
	
	tests := []struct {
		name        string
		input       string
		expectError bool
		description string
	}{
		{
			name:        "simple relative path",
			input:       "documents/file.pdf",
			expectError: false,
			description: "Normal paths should work",
		},
		{
			name:        "dot dot attack",
			input:       "../../../etc/passwd",
			expectError: true,
			description: "Classic path traversal should be blocked",
		},
		{
			name:        "nested dot dot",
			input:       "safe/../../etc/passwd",
			expectError: true,
			description: "Nested traversal should be blocked",
		},
		{
			name:        "encoded dot dot",
			input:       "safe/%2e%2e/etc/passwd",
			expectError: false, // URL encoding is handled by HTTP layer
			description: "URL encoded paths (handled elsewhere)",
		},
		{
			name:        "absolute path unix",
			input:       "/etc/passwd",
			expectError: true,
			description: "Absolute paths should be blocked",
		},
		{
			name:        "absolute path windows",
			input:       "C:\\Windows\\System32",
			expectError: true,
			description: "Windows absolute paths should be blocked",
		},
		{
			name:        "UNC path",
			input:       "\\\\server\\share\\file",
			expectError: true,
			description: "UNC paths should be blocked",
		},
		{
			name:        "empty path",
			input:       "",
			expectError: false,
			description: "Empty path should normalize to '.'",
		},
		{
			name:        "current directory",
			input:       ".",
			expectError: false,
			description: "Current directory should be allowed",
		},
		{
			name:        "multiple slashes",
			input:       "documents//subfolder///file.pdf",
			expectError: false,
			description: "Multiple slashes should be cleaned",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result, err := b.sanitizePath(tt.input)
			
			if tt.expectError && err == nil {
				t.Errorf("Expected error for input %q but got none. Result: %q", tt.input, result)
			}
			
			if !tt.expectError && err != nil {
				t.Errorf("Unexpected error for input %q: %v", tt.input, err)
			}
			
			// Additional validation: result should never contain ".."
			if err == nil && result != "" && result != "." {
				if containsDotDot(result) {
					t.Errorf("Sanitized path %q still contains '..' segments", result)
				}
			}
		})
	}
}

// TestSanitizePath_SpecialCharacters tests that special characters are handled (F1)
func TestSanitizePath_SpecialCharacters(t *testing.T) {
	b := &VaultBridge{}
	
	tests := []struct {
		name     string
		input    string
		expected string
	}{
		{
			name:     "angle brackets",
			input:    "file<test>.pdf",
			expected: "file_test_.pdf",
		},
		{
			name:     "colon",
			input:    "file:test.pdf",
			expected: "file_test.pdf",
		},
		{
			name:     "quotes",
			input:    "file\"test\".pdf",
			expected: "file_test_.pdf",
		},
		{
			name:     "pipe",
			input:    "file|test.pdf",
			expected: "file_test.pdf",
		},
		{
			name:     "question mark",
			input:    "file?test.pdf",
			expected: "file_test.pdf",
		},
		{
			name:     "asterisk",
			input:    "file*test.pdf",
			expected: "file_test.pdf",
		},
		{
			name:     "backslash",
			input:    "file\\test.pdf",
			expected: "file_test.pdf",
		},
		{
			name:     "control characters",
			input:    "file\x00\x01\x1Ftest.pdf",
			expected: "file___test.pdf",
		},
		{
			name:     "unicode control chars",
			input:    "file\u007F\u0080\u009Ftest.pdf",
			expected: "file___test.pdf",
		},
		{
			name:     "normal unicode",
			input:    "файл_тест.pdf",
			expected: "файл_тест.pdf",
		},
		{
			name:     "emoji in filename",
			input:    "file_😀_test.pdf",
			expected: "file_😀_test.pdf",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result, err := b.sanitizePath(tt.input)
			
			if err != nil {
				t.Errorf("Unexpected error for input %q: %v", tt.input, err)
				return
			}
			
			if result != tt.expected {
				t.Errorf("For input %q, expected %q but got %q", tt.input, tt.expected, result)
			}
		})
	}
}

// TestSanitizePath_EdgeCases tests edge cases and boundary conditions
func TestSanitizePath_EdgeCases(t *testing.T) {
	b := &VaultBridge{}
	
	tests := []struct {
		name        string
		input       string
		expectError bool
	}{
		{
			name:        "very long path",
			input:       "a/b/c/d/e/f/g/h/i/j/k/l/m/n/o/p/q/r/s/t/u/v/w/x/y/z/file.pdf",
			expectError: false,
		},
		{
			name:        "path with spaces",
			input:       "my documents/my file.pdf",
			expectError: false,
		},
		{
			name:        "path with dots in filename",
			input:       "archive.2024.01.30.tar.gz",
			expectError: false,
		},
		{
			name:        "hidden file",
			input:       ".gitignore",
			expectError: false,
		},
		{
			name:        "hidden directory",
			input:       ".config/settings.json",
			expectError: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result, err := b.sanitizePath(tt.input)
			
			if tt.expectError && err == nil {
				t.Errorf("Expected error for input %q but got none. Result: %q", tt.input, result)
			}
			
			if !tt.expectError && err != nil {
				t.Errorf("Unexpected error for input %q: %v", tt.input, err)
			}
		})
	}
}

// Helper function to check if a path contains ".." segments
func containsDotDot(path string) bool {
	parts := []string{}
	current := ""
	
	for _, r := range path {
		if r == '/' || r == '\\' {
			if current != "" {
				parts = append(parts, current)
				current = ""
			}
		} else {
			current += string(r)
		}
	}
	if current != "" {
		parts = append(parts, current)
	}
	
	for _, part := range parts {
		if part == ".." {
			return true
		}
	}
	return false
}
