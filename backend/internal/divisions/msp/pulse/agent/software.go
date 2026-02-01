package agent

import (
	"bufio"
	"bytes"
	"os/exec"
	"runtime"
	"sent/internal/divisions/msp/pulse/common"
	"strings"
)

func GetInstalledSoftware() []common.SoftwareInfo {
	switch runtime.GOOS {
	case "windows":
		return getWindowsSoftware()
	case "linux":
		return getLinuxSoftware()
	default:
		return []common.SoftwareInfo{}
	}
}

func getWindowsSoftware() []common.SoftwareInfo {
	// Using simple wmic for MVP (Slow but standard)
	// Production should use Registry reading for speed
	cmd := exec.Command("wmic", "product", "get", "Name,Version,Vendor,InstallDate", "/format:csv")
	output, err := cmd.Output()
	if err != nil {
		return []common.SoftwareInfo{}
	}

	var software []common.SoftwareInfo
	scanner := bufio.NewScanner(bytes.NewReader(output))
	// Skip header usually
	isHeader := true
	for scanner.Scan() {
		line := scanner.Text()
		if strings.TrimSpace(line) == "" {
			continue
		}
		if isHeader {
			isHeader = false // WMIC CSV header Node,InstallDate,Name,Vendor,Version
			continue
		}

		parts := strings.Split(line, ",")
		if len(parts) >= 5 {
			// Node, InstallDate, Name, Vendor, Version
			s := common.SoftwareInfo{
				InstallDate: parts[1],
				Name:        parts[2],
				Publisher:   parts[3],
				Version:     parts[4],
			}
			if s.Name != "" {
				software = append(software, s)
			}
		}
	}
	return software
}

func getLinuxSoftware() []common.SoftwareInfo {
	// Try dpkg first (Debian/Ubuntu)
	if _, err := exec.LookPath("dpkg"); err == nil {
		return getDebianSoftware()
	}
	// Try rpm (RHEL/CentOS)
	if _, err := exec.LookPath("rpm"); err == nil {
		return getRpmSoftware()
	}
	return []common.SoftwareInfo{}
}

func getDebianSoftware() []common.SoftwareInfo {
	cmd := exec.Command("dpkg-query", "-W", "-f=${Package},${Version},${api:Summary}\n")
	output, err := cmd.Output()
	if err != nil {
		return []common.SoftwareInfo{}
	}

	var software []common.SoftwareInfo
	scanner := bufio.NewScanner(bytes.NewReader(output))
	for scanner.Scan() {
		line := scanner.Text()
		parts := strings.Split(line, ",")
		if len(parts) >= 2 {
			software = append(software, common.SoftwareInfo{
				Name:      parts[0],
				Version:   parts[1],
				Publisher: "apt",
			})
		}
	}
	return software
}

func getRpmSoftware() []common.SoftwareInfo {
	cmd := exec.Command("rpm", "-qa", "--queryformat", "%{NAME},%{VERSION},%{VENDOR}\n")
	output, err := cmd.Output()
	if err != nil {
		return []common.SoftwareInfo{}
	}

	var software []common.SoftwareInfo
	scanner := bufio.NewScanner(bytes.NewReader(output))
	for scanner.Scan() {
		line := scanner.Text()
		parts := strings.Split(line, ",")
		if len(parts) >= 3 {
			software = append(software, common.SoftwareInfo{
				Name:      parts[0],
				Version:   parts[1],
				Publisher: parts[2],
			})
		}
	}
	return software
}
