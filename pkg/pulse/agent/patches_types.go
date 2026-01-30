package agent

// PatchInfo represents a pending or installed patch
type PatchInfo struct {
	ID        string `json:"id"`        // KB number or package name
	Title     string `json:"title"`     // Description
	Severity  string `json:"severity"`  // Critical, Important, Moderate, Low
	Size      int64  `json:"size"`      // Bytes
	Published string `json:"published"` // Date string
	Installed bool   `json:"installed"`
}
