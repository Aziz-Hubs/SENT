package agent

import (
	"bufio"
	"os/exec"
	"strings"
)

// DetectPackageManager returns the package manager type
func DetectPackageManager() string {
	managers := []struct {
		cmd  string
		name string
	}{
		{"apt", "apt"},
		{"dnf", "dnf"},
		{"yum", "yum"},
		{"zypper", "zypper"},
		{"pacman", "pacman"},
	}

	for _, m := range managers {
		if _, err := exec.LookPath(m.cmd); err == nil {
			return m.name
		}
	}
	return "unknown"
}

// getLinuxUpdates returns pending package updates
func getLinuxUpdates() ([]PatchInfo, error) {
	pm := DetectPackageManager()
	switch pm {
	case "apt":
		return getAptUpdates()
	case "dnf", "yum":
		return getDnfUpdates(pm)
	default:
		return []PatchInfo{}, nil
	}
}

// GetPendingPatches returns available updates for the system (Linux)
func GetPendingPatches() ([]PatchInfo, error) {
	return getLinuxUpdates()
}

// InstallPatches installs specified patches (Linux)
func InstallPatches(patchIDs []string) error {
	return installLinuxPatches(patchIDs)
}

func getAptUpdates() ([]PatchInfo, error) {
	// First, update package lists (silent)
	exec.Command("apt", "update", "-qq").Run()

	// Get upgradable packages
	cmd := exec.Command("apt", "list", "--upgradable")
	output, err := cmd.Output()
	if err != nil {
		return []PatchInfo{}, nil
	}

	patches := []PatchInfo{}
	scanner := bufio.NewScanner(strings.NewReader(string(output)))
	for scanner.Scan() {
		line := scanner.Text()
		if strings.HasPrefix(line, "Listing...") {
			continue
		}
		// Format: package/release version arch [upgradable from: old-version]
		parts := strings.Split(line, "/")
		if len(parts) >= 1 {
			packageName := parts[0]
			patches = append(patches, PatchInfo{
				ID:       packageName,
				Title:    line,
				Severity: categorizeSeverity(packageName),
				Installed: false,
			})
		}
	}
	return patches, nil
}

func getDnfUpdates(pm string) ([]PatchInfo, error) {
	cmd := exec.Command(pm, "check-update", "-q")
	output, _ := cmd.Output() // check-update returns exit code 100 when updates available

	patches := []PatchInfo{}
	scanner := bufio.NewScanner(strings.NewReader(string(output)))
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" {
			continue
		}
		// Format: package-name.arch  version  repo
		fields := strings.Fields(line)
		if len(fields) >= 1 {
			patches = append(patches, PatchInfo{
				ID:       fields[0],
				Title:    line,
				Severity: categorizeSeverity(fields[0]),
				Installed: false,
			})
		}
	}
	return patches, nil
}

func installLinuxPatches(patchIDs []string) error {
	pm := DetectPackageManager()
	var cmd *exec.Cmd

	switch pm {
	case "apt":
		cmd = exec.Command("apt", "upgrade", "-y")
	case "dnf":
		cmd = exec.Command("dnf", "upgrade", "-y")
	case "yum":
		cmd = exec.Command("yum", "update", "-y")
	default:
		return nil
	}

	return cmd.Run()
}

// categorizeSeverity attempts to guess severity from package name
func categorizeSeverity(packageName string) string {
	name := strings.ToLower(packageName)
	if strings.Contains(name, "kernel") || strings.Contains(name, "security") {
		return "Critical"
	}
	if strings.Contains(name, "ssl") || strings.Contains(name, "openssl") || strings.Contains(name, "openssh") {
		return "Important"
	}
	return "Moderate"
}
