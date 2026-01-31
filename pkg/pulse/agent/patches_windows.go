package agent

import (
	"encoding/json"
	"os/exec"
)

// --- Windows Update Implementation ---

func getWindowsUpdates() ([]PatchInfo, error) {
	script := `
$UpdateSession = New-Object -ComObject Microsoft.Update.Session
$UpdateSearcher = $UpdateSession.CreateUpdateSearcher()
$SearchResult = $UpdateSearcher.Search("IsInstalled=0 and Type='Software'")
$Updates = @()
foreach ($Update in $SearchResult.Updates) {
    $Updates += @{
        ID = $Update.KBArticleIDs -join ","
        Title = $Update.Title
        Severity = if ($Update.MsrcSeverity) { $Update.MsrcSeverity } else { "Unknown" }
        Size = $Update.MaxDownloadSize
        Published = $Update.LastDeploymentChangeTime.ToString("yyyy-MM-dd")
    }
}
$Updates | ConvertTo-Json -Compress
`
	cmd := exec.Command("powershell", "-NoProfile", "-Command", script)
	output, err := cmd.Output()
	if err != nil {
		return []PatchInfo{}, nil
	}

	var rawUpdates []map[string]interface{}
	if err := json.Unmarshal(output, &rawUpdates); err != nil {
		var single map[string]interface{}
		if err := json.Unmarshal(output, &single); err == nil {
			rawUpdates = []map[string]interface{}{single}
		} else {
			return []PatchInfo{}, nil
		}
	}

	patches := make([]PatchInfo, 0, len(rawUpdates))
	for _, u := range rawUpdates {
		patch := PatchInfo{
			ID:        getString(u, "ID"),
			Title:     getString(u, "Title"),
			Severity:  getString(u, "Severity"),
			Published: getString(u, "Published"),
			Installed: false,
		}
		if size, ok := u["Size"].(float64); ok {
			patch.Size = int64(size)
		}
		patches = append(patches, patch)
	}
	return patches, nil
}

func installWindowsPatches(patchIDs []string) error {
	script := `
$UpdateSession = New-Object -ComObject Microsoft.Update.Session
$UpdateSearcher = $UpdateSession.CreateUpdateSearcher()
$SearchResult = $UpdateSearcher.Search("IsInstalled=0 and Type='Software'")
$UpdatesToInstall = New-Object -ComObject Microsoft.Update.UpdateColl
foreach ($Update in $SearchResult.Updates) {
    $UpdatesToInstall.Add($Update) | Out-Null
}
if ($UpdatesToInstall.Count -gt 0) {
    $Installer = $UpdateSession.CreateUpdateInstaller()
    $Installer.Updates = $UpdatesToInstall
    $Result = $Installer.Install()
    Write-Output "Installed $($UpdatesToInstall.Count) updates"
}
`
	cmd := exec.Command("powershell", "-NoProfile", "-Command", script)
	return cmd.Run()
}

// GetPendingPatches returns available updates for the system (Windows)
func GetPendingPatches() ([]PatchInfo, error) {
	return getWindowsUpdates()
}

// InstallPatches installs specified patches (Windows)
func InstallPatches(patchIDs []string) error {
	return installWindowsPatches(patchIDs)
}
