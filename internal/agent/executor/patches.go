package executor

import (
	"context"
	"fmt"
	"os/exec"
	"runtime"
	"strings"
	"time"
)

// HandleInstallPatches installs the specified patches.
// patchIDsStr is a comma-separated list of patch IDs (KB numbers for Windows, package names for Linux).
func HandleInstallPatches(ctx context.Context, patchIDsStr string) error {
	if patchIDsStr == "" {
		return fmt.Errorf("no patch IDs provided")
	}
	patchIDs := strings.Split(patchIDsStr, ",")

	switch runtime.GOOS {
	case "windows":
		return installWindowsPatches(ctx, patchIDs)
	case "linux":
		return installLinuxPatches(ctx, patchIDs)
	default:
		return fmt.Errorf("unsupported OS for patch installation: %s", runtime.GOOS)
	}
}

func installWindowsPatches(ctx context.Context, kbIDs []string) error {
	// PowerShell script to install updates via COM object
	// We pass KB IDs as arguments
	kbList := "'" + strings.Join(kbIDs, "','") + "'"

	psScript := fmt.Sprintf(`
$KBIDs = @(%s)
$UpdateSession = New-Object -ComObject Microsoft.Update.Session
$UpdateSearcher = $UpdateSession.CreateUpdateSearcher()
$SearchResult = $UpdateSearcher.Search("IsInstalled=0 and Type='Software' and IsHidden=0")

$UpdatesToInstall = New-Object -ComObject Microsoft.Update.UpdateColl
foreach ($Update in $SearchResult.Updates) {
    foreach($kb in $Update.KBArticleIDs) {
        if ($KBIDs -contains $kb) {
            $UpdatesToInstall.Add($Update) | Out-Null
            break
        }
    }
}

if ($UpdatesToInstall.Count -eq 0) {
    Write-Output "No matching updates found to install."
    exit 0
}

Write-Output "Downloading $($UpdatesToInstall.Count) updates..."
$Downloader = $UpdateSession.CreateUpdateDownloader()
$Downloader.Updates = $UpdatesToInstall
$Downloader.Download()

Write-Output "Installing updates..."
$Installer = $UpdateSession.CreateUpdateInstaller()
$Installer.Updates = $UpdatesToInstall
$Result = $Installer.Install()

if ($Result.ResultCode -ne 2) {
    throw "Installation failed with ResultCode $($Result.ResultCode)"
}
Write-Output "Installation Successful"
`, kbList)

	// Execute PowerShell with a longer timeout for installation
	installCtx, cancel := context.WithTimeout(ctx, 30*time.Minute)
	defer cancel()

	cmd := exec.CommandContext(installCtx, "powershell", "-NoProfile", "-NonInteractive", "-Command", psScript)
	output, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf("windows patch installation failed: %v, output: %s", err, string(output))
	}

	// Check output for success if needed, but error code should catch most failures
	return nil
}

func installLinuxPatches(ctx context.Context, packages []string) error {
	installCtx, cancel := context.WithTimeout(ctx, 15*time.Minute)
	defer cancel()

	// apt-get
	if _, err := exec.LookPath("apt-get"); err == nil {
		args := append([]string{"install", "-y", "--only-upgrade"}, packages...)
		cmd := exec.CommandContext(installCtx, "apt-get", args...)
		output, err := cmd.CombinedOutput()
		if err != nil {
			return fmt.Errorf("apt-get install failed: %v, output: %s", err, string(output))
		}
		return nil
	}

	// yum
	if _, err := exec.LookPath("yum"); err == nil {
		args := append([]string{"update", "-y"}, packages...)
		cmd := exec.CommandContext(installCtx, "yum", args...)
		output, err := cmd.CombinedOutput()
		if err != nil {
			return fmt.Errorf("yum update failed: %v, output: %s", err, string(output))
		}
		return nil
	}

	// dnf
	if _, err := exec.LookPath("dnf"); err == nil {
		args := append([]string{"update", "-y"}, packages...)
		cmd := exec.CommandContext(installCtx, "dnf", args...)
		output, err := cmd.CombinedOutput()
		if err != nil {
			return fmt.Errorf("dnf update failed: %v, output: %s", err, string(output))
		}
		return nil
	}

	return fmt.Errorf("no supported package manager found (apt-get, yum, dnf)")
}
