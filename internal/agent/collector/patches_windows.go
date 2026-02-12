package collector

import (
	"context"
	"encoding/json"
	"fmt"
	"os/exec"
	"strings"
	"time"

	sentpulsev1 "sent-platform/pkg/proto/sentpulse/v1"

	"google.golang.org/protobuf/types/known/timestamppb"
)

// CollectPatches gathers available patches.
func CollectPatches() ([]*sentpulsev1.Patch, error) {
	// 1. Define PowerShell script to check for updates using COM object (no module required)
	psScript := `
$UpdateSession = New-Object -ComObject Microsoft.Update.Session
$UpdateSearcher = $UpdateSession.CreateUpdateSearcher()
$Limit = 50 # Limit to prevent timeouts
$SearchResult = $UpdateSearcher.Search("IsInstalled=0 and Type='Software' and IsHidden=0")

$Updates = @()
foreach ($Update in $SearchResult.Updates) {
    $KBArticleIDs = @()
    foreach($kb in $Update.KBArticleIDs) { $KBArticleIDs += $kb }
    
    $Severity = "Moderate"
    if ($Update. MsrcSeverity) { $Severity = $Update.MsrcSeverity }
    
    $Categories = @()
    foreach($cat in $Update.Categories) { $Categories += $cat.Name }

    $Updates += [PSCustomObject]@{
        Title = $Update.Title
        Description = $Update.Description
        KB = $KBArticleIDs -join ","
        Severity = $Severity
        Categories = $Categories -join ","
        Size = $Update.MaxDownloadSize
        IsInstalled = $Update.IsInstalled
    }
}
$Updates | ConvertTo-Json -Depth 2
`

	// 2. Execute PowerShell
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Minute)
	defer cancel()

	cmd := exec.CommandContext(ctx, "powershell", "-NoProfile", "-NonInteractive", "-Command", psScript)
	output, err := cmd.CombinedOutput()
	if err != nil {
		return nil, fmt.Errorf("failed to search updates: %v, output: %s", err, string(output))
	}

	if len(output) == 0 || string(output) == "null\r\n" {
		return []*sentpulsev1.Patch{}, nil
	}

	// 3. Parse JSON output
	var updates []struct {
		Title       string      `json:"Title"`
		Description string      `json:"Description"`
		KB          string      `json:"KB"`
		Severity    string      `json:"Severity"`
		Categories  string      `json:"Categories"`
		Size        interface{} `json:"Size"` // Can be int or string
		IsInstalled bool        `json:"IsInstalled"`
	}

	// Handle single object vs array
	jsonStr := string(output)
	if jsonStr[0] == '{' {
		jsonStr = "[" + jsonStr + "]"
	}

	if err := json.Unmarshal([]byte(jsonStr), &updates); err != nil {
		// Attempt to handle single object if unmarshal failed (though the [ check should handle it)
		return nil, fmt.Errorf("failed to parse update json: %v, body: %s", err, string(output))
	}

	// 4. Map to Protobuf
	patches := make([]*sentpulsev1.Patch, 0, len(updates))
	for _, u := range updates {
		p := &sentpulsev1.Patch{
			Id:          u.KB,
			KbId:        u.KB,
			Title:       u.Title,
			Description: u.Description,
			Status:      sentpulsev1.PatchStatus_PATCH_STATUS_NOT_INSTALLED,
			Severity:    mapSeverity(u.Severity),
			Category:    mapCategory(u.Categories),
			SizeBytes:   parseInt64(u.Size),
			ReleaseDate: timestamppb.Now(), // Placeholder as COM doesn't give easy release date
		}
		if p.Id == "" {
			p.Id = strings.ReplaceAll(u.Title, " ", "_") // Fallback to Title if KB is empty
			p.KbId = "N/A"
		}
		patches = append(patches, p)
	}

	return patches, nil
}

func mapSeverity(s string) sentpulsev1.PatchSeverity {
	switch s {
	case "Critical":
		return sentpulsev1.PatchSeverity_PATCH_SEVERITY_CRITICAL
	case "Important":
		return sentpulsev1.PatchSeverity_PATCH_SEVERITY_IMPORTANT
	case "Moderate":
		return sentpulsev1.PatchSeverity_PATCH_SEVERITY_MODERATE
	case "Low":
		return sentpulsev1.PatchSeverity_PATCH_SEVERITY_LOW
	}
	return sentpulsev1.PatchSeverity_PATCH_SEVERITY_UNSPECIFIED
}

func mapCategory(c string) sentpulsev1.PatchCategory {
	if strings.Contains(c, "Security") {
		return sentpulsev1.PatchCategory_PATCH_CATEGORY_SECURITY
	} else if strings.Contains(c, "Critical") {
		return sentpulsev1.PatchCategory_PATCH_CATEGORY_CRITICAL
	} else if strings.Contains(c, "Definition") {
		return sentpulsev1.PatchCategory_PATCH_CATEGORY_UPDATES
	} else if strings.Contains(c, "Driver") {
		return sentpulsev1.PatchCategory_PATCH_CATEGORY_DRIVERS
	}
	return sentpulsev1.PatchCategory_PATCH_CATEGORY_FEATURE
}

func parseInt64(v interface{}) int64 {
	switch val := v.(type) {
	case float64:
		return int64(val)
	case int64:
		return val
	case int:
		return int64(val)
	default:
		return 0
	}
}
