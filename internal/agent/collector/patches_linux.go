package collector

import (
	"context"
	"fmt"
	"os/exec"
	"strings"
	"time"

	sentpulsev1 "sent-platform/pkg/proto/sentpulse/v1"

	"google.golang.org/protobuf/types/known/timestamppb"
)

// CollectPatches gathers available patches on Linux.
func CollectPatches() ([]*sentpulsev1.Patch, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Minute)
	defer cancel()

	// Check for apt-get (Debian/Ubuntu)
	if _, err := exec.LookPath("apt-get"); err == nil {
		return collectAptPatches(ctx)
	}

	// Check for yum/dnf (RHEL/CentOS/Fedora)
	if _, err := exec.LookPath("dnf"); err == nil {
		return collectDnfPatches(ctx, "dnf")
	}
	if _, err := exec.LookPath("yum"); err == nil {
		return collectDnfPatches(ctx, "yum")
	}

	return []*sentpulsev1.Patch{}, fmt.Errorf("package manager not supported")
}

func collectAptPatches(ctx context.Context) ([]*sentpulsev1.Patch, error) {
	// apt list --upgradable
	cmd := exec.CommandContext(ctx, "apt", "list", "--upgradable")
	output, err := cmd.CombinedOutput()
	if err != nil {
		// Attempt apt-get check if apt fails (older systems) or ignore error if just no updates
		// But apt list returns exit code 0 usually.
		return nil, fmt.Errorf("apt list failed: %v", err)
	}

	lines := strings.Split(string(output), "\n")
	var patches []*sentpulsev1.Patch

	for _, line := range lines {
		if strings.HasPrefix(line, "Listing...") {
			continue
		}
		if strings.TrimSpace(line) == "" {
			continue
		}
		// Format: package/release series version arch [upgradable from: old_version]
		// e.g. curl/stable 7.81.0-1ubuntu1.16 amd64 [upgradable from: 7.81.0-1ubuntu1.15]
		parts := strings.Fields(line)
		if len(parts) >= 2 {
			pkgName := strings.Split(parts[0], "/")[0]
			version := parts[1]

			patches = append(patches, &sentpulsev1.Patch{
				Id:          pkgName,
				Title:       fmt.Sprintf("Update for %s", pkgName),
				Description: fmt.Sprintf("Upgrade to version %s", version),
				Version:     version,
				Status:      sentpulsev1.PatchStatus_PATCH_STATUS_NOT_INSTALLED,
				Severity:    sentpulsev1.PatchSeverity_PATCH_SEVERITY_MODERATE, // Default
				Category:    sentpulsev1.PatchCategory_PATCH_CATEGORY_UPDATES,
				ReleaseDate: timestamppb.Now(),
			})
		}
	}
	return patches, nil
}

func collectDnfPatches(ctx context.Context, bin string) ([]*sentpulsev1.Patch, error) {
	// dnf check-update
	// Returns 100 if updates are available, 0 if none, 1 if error.
	cmd := exec.CommandContext(ctx, bin, "check-update")
	output, err := cmd.CombinedOutput()

	// Exit code 100 is valid for dnf check-update
	if err != nil {
		if exitError, ok := err.(*exec.ExitError); ok {
			if exitError.ExitCode() != 100 {
				return nil, fmt.Errorf("%s check-update failed: %v", bin, err)
			}
		} else {
			return nil, fmt.Errorf("%s check-update failed: %v", bin, err)
		}
	}

	lines := strings.Split(string(output), "\n")
	var patches []*sentpulsev1.Patch
	startParsing := false

	for _, line := range lines {
		if strings.TrimSpace(line) == "" {
			continue
		}
		// Skip headers, usually implied by empty line separator or check for specific header logic
		// Simply assuming lines logic: Package Arch Version Repository
		// e.g. NetworkManager.x86_64 1:1.32.10-1.el8_6 baseos
		parts := strings.Fields(line)
		if len(parts) >= 3 {
			// Basic heuristic to skip headers (if any)
			// Or just assume anything with 3+ fields is a package if commands finished

			// For robustness, maybe we should just parse.
			// Ideally we verify it looks like: name.arch version repo

			pkgNameArch := parts[0]
			version := parts[1]
			pkgName := strings.Split(pkgNameArch, ".")[0]

			patches = append(patches, &sentpulsev1.Patch{
				Id:          pkgName,
				Title:       fmt.Sprintf("Update for %s", pkgName),
				Description: fmt.Sprintf("Upgrade to version %s", version),
				Version:     version,
				Status:      sentpulsev1.PatchStatus_PATCH_STATUS_NOT_INSTALLED,
				Severity:    sentpulsev1.PatchSeverity_PATCH_SEVERITY_MODERATE,
				Category:    sentpulsev1.PatchCategory_PATCH_CATEGORY_UPDATES,
				ReleaseDate: timestamppb.Now(),
			})
		}
	}
	return patches, nil
}
