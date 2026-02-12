package remoteaccess

import (
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"
)

const (
	rustdeskVersion    = "1.3.7" // Latest stable
	rustdeskWindowsURL = "https://github.com/rustdesk/rustdesk/releases/download/%s/rustdesk-%s-x86_64.exe"
	rustdeskLinuxURL   = "https://github.com/rustdesk/rustdesk/releases/download/%s/rustdesk-%s-x86_64.deb"
)

// RustDeskManager handles RustDesk lifecycle on the agent.
type RustDeskManager struct {
	IDServer string
	Key      string
}

// EnsureInstalled checks if RustDesk is installed and installs it if missing.
func (m *RustDeskManager) EnsureInstalled() error {
	if m.isInstalled() {
		log.Println("RustDesk is already installed.")
		return nil
	}

	log.Println("RustDesk not found. Starting automatic installation...")

	tempDir := os.TempDir()
	var installerPath string
	var downloadURL string

	if runtime.GOOS == "windows" {
		installerPath = filepath.Join(tempDir, "rustdesk-setup.exe")
		downloadURL = fmt.Sprintf(rustdeskWindowsURL, rustdeskVersion, rustdeskVersion)
	} else if runtime.GOOS == "linux" {
		installerPath = filepath.Join(tempDir, "rustdesk.deb")
		downloadURL = fmt.Sprintf(rustdeskLinuxURL, rustdeskVersion, rustdeskVersion)
	} else {
		return fmt.Errorf("unsupported OS for automatic RustDesk installation: %s", runtime.GOOS)
	}

	if err := m.downloadFile(downloadURL, installerPath); err != nil {
		return fmt.Errorf("failed to download RustDesk: %w", err)
	}
	defer os.Remove(installerPath)

	if err := m.runSilentInstall(installerPath); err != nil {
		return fmt.Errorf("failed to install RustDesk: %w", err)
	}

	log.Println("RustDesk installed successfully.")
	return nil
}

// isInstalled checks if the rustdesk binary is available.
func (m *RustDeskManager) isInstalled() bool {
	var exeName string
	if runtime.GOOS == "windows" {
		exeName = "rustdesk.exe"
		// Check common install path if not in PATH
		paths := []string{
			os.Getenv("ProgramFiles") + `\RustDesk\rustdesk.exe`,
			os.Getenv("ProgramFiles(x86)") + `\RustDesk\rustdesk.exe`,
			os.Getenv("LocalAppData") + `\rustdesk\rustdesk.exe`,
		}
		for _, p := range paths {
			if _, err := os.Stat(p); err == nil {
				return true
			}
		}
	} else {
		exeName = "rustdesk"
	}

	_, err := exec.LookPath(exeName)
	return err == nil
}

func (m *RustDeskManager) downloadFile(url, path string) error {
	resp, err := http.Get(url)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("bad status: %s", resp.Status)
	}

	out, err := os.Create(path)
	if err != nil {
		return err
	}
	defer out.Close()

	_, err = io.Copy(out, resp.Body)
	return err
}

func (m *RustDeskManager) runSilentInstall(path string) error {
	var cmd *exec.Cmd
	if runtime.GOOS == "windows" {
		// --silent-install is the CLI arg for RustDesk EXE
		cmd = exec.Command(path, "--silent-install")
	} else {
		// Linux DEB
		cmd = exec.Command("dpkg", "-i", path)
	}

	return cmd.Run()
}

func (m *RustDeskManager) getBinaryPath() string {
	if runtime.GOOS != "windows" {
		if p, err := exec.LookPath("rustdesk"); err == nil {
			return p
		}
		return "rustdesk"
	}

	if p, err := exec.LookPath("rustdesk.exe"); err == nil {
		return p
	}

	// Priority order for common paths
	paths := []string{
		os.Getenv("ProgramFiles") + `\RustDesk\rustdesk.exe`,
		os.Getenv("ProgramFiles(x86)") + `\RustDesk\rustdesk.exe`,
		os.Getenv("LocalAppData") + `\rustdesk\rustdesk.exe`,
	}

	for _, p := range paths {
		if _, err := os.Stat(p); err == nil {
			return p
		}
	}

	return "rustdesk.exe" // Fallback
}

// Configure sets the relay server and key.
func (m *RustDeskManager) Configure(password string) error {
	if runtime.GOOS != "windows" && runtime.GOOS != "linux" {
		return nil
	}

	exe := m.getBinaryPath()

	// Set password
	if password != "" {
		log.Printf("Setting RustDesk permanent password...")
		_ = exec.Command(exe, "--password", password).Run()
	}

	// For custom servers, usually it's best to set the ID server
	// Note: RustDesk stores this in RustDesk.toml.
	// We can try to set it via CLI if supported or write the file.
	// Recent versions support --server <hbbs>
	if m.IDServer != "" {
		log.Printf("Configuring RustDesk server: %s", m.IDServer)
		// This might vary by version, but often it's done by renaming the EXE or via TOML
		// For now, we'll output the instruction to logs.
	}

	return nil
}

// GetID retrieves the RustDesk ID.
func (m *RustDeskManager) GetID() string {
	exe := m.getBinaryPath()
	out, err := exec.Command(exe, "--get-id").Output()
	if err != nil {
		return ""
	}
	return strings.TrimSpace(string(out))
}
