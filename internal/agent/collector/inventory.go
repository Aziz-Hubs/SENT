package collector

import (
	"context"
	"log"
	"runtime"
	"strings"
	"time"

	"github.com/shirou/gopsutil/v4/cpu"
	"github.com/shirou/gopsutil/v4/disk"
	"github.com/shirou/gopsutil/v4/host"
	"github.com/shirou/gopsutil/v4/mem"
	"github.com/shirou/gopsutil/v4/net"
	"github.com/shirou/gopsutil/v4/process"

	sentpulsev1 "sent-platform/pkg/proto/sentpulse/v1"

	"google.golang.org/protobuf/types/known/timestamppb"
)

var (
	lastPatchCollect time.Time
	cachedPatches    []*sentpulsev1.Patch
)

// Inventory holds the detailed device inventory.
type Inventory struct {
	OSInfo            *sentpulsev1.OSInfo
	Hardware          *sentpulsev1.HardwareInfo
	NetworkInterfaces []*sentpulsev1.NetworkInterface
	StorageDrives     []*sentpulsev1.StorageDrive
	Processes         []*sentpulsev1.DeviceProcess
	Services          []*sentpulsev1.ServiceItem
	Patches           []*sentpulsev1.Patch
	LocalIP           string
	MACAddress        string
	BootTime          *timestamppb.Timestamp
	CurrentUser       string
	// Dynamic Stats
	CPUUsage    float32
	MemoryUsage float32
	DiskUsage   float32
}

// CollectInventory gathers detailed system inventory.
func CollectInventory() (*Inventory, error) {
	inv := &Inventory{
		OSInfo:            &sentpulsev1.OSInfo{},
		Hardware:          &sentpulsev1.HardwareInfo{},
		NetworkInterfaces: make([]*sentpulsev1.NetworkInterface, 0),
		StorageDrives:     make([]*sentpulsev1.StorageDrive, 0),
		Processes:         make([]*sentpulsev1.DeviceProcess, 0),
		Services:          make([]*sentpulsev1.ServiceItem, 0),
		Patches:           make([]*sentpulsev1.Patch, 0),
	}

	// Host Info
	h, err := host.Info()
	if err != nil {
		log.Printf("Error getting host info: %v", err)
	} else {
		inv.OSInfo.Name = h.Platform           // e.g. "windows"
		inv.OSInfo.Version = h.PlatformVersion // e.g. "10.0.19044"
		inv.OSInfo.Build = h.KernelVersion     // e.g. "10.0.19044.1234"
		inv.OSInfo.Architecture = h.KernelArch // e.g. "x86_64"
		inv.OSInfo.Platform = h.OS             // e.g. "windows"

		inv.BootTime = timestamppb.New(time.Unix(int64(h.BootTime), 0))
		inv.Hardware.Manufacturer = "Check logs/wmic"
		inv.Hardware.Model = "N/A"
	}

	// ... (cpu, memory, network, etc - omitted for brevity in this replace block if not changing)

	// CPU, Memory, Network logic remains...
	// I need to be careful not to delete the intervening lines if I use a single block.
	// Since I'm using replace_file_content with a range, I must include everything in that range.
	// The range 29-115 is too large for safety if I don't copy everything.
	// I'll make two separate edits.

	// Hardware - CPU
	c, err := cpu.Info()
	if err != nil {
		log.Printf("Error getting cpu info: %v", err)
	} else if len(c) > 0 {
		inv.Hardware.ProcessorModel = c[0].ModelName
		inv.Hardware.ProcessorCores = int32(len(c))
		inv.Hardware.Manufacturer = c[0].VendorID
	}

	// CPU Usage
	cpuPercents, err := cpu.Percent(0, false)
	if err == nil && len(cpuPercents) > 0 {
		inv.CPUUsage = float32(cpuPercents[0])
	}

	// Hardware - Memory
	v, err := mem.VirtualMemory()
	if err != nil {
		log.Printf("Error getting memory info: %v", err)
	} else {
		inv.Hardware.RamTotalBytes = v.Total
		inv.Hardware.RamUsedBytes = v.Used
		inv.MemoryUsage = float32(v.UsedPercent)
	}

	// Network Interfaces
	ifaces, err := net.Interfaces()
	if err != nil {
		log.Printf("Error getting network interfaces: %v", err)
	} else {
		for _, i := range ifaces {
			nic := &sentpulsev1.NetworkInterface{
				Name:       i.Name,
				MacAddress: i.HardwareAddr,
				Status:     "down",
			}

			for _, flag := range i.Flags {
				if flag == "up" {
					nic.Status = "up"
					break
				}
			}

			for _, addr := range i.Addrs {
				ip := strings.Split(addr.Addr, "/")[0]
				if strings.Contains(ip, ":") {
					nic.IpV6 = ip
				} else {
					nic.IpV4 = ip
					if inv.LocalIP == "" && ip != "127.0.0.1" && nic.Status == "up" {
						inv.LocalIP = ip
						inv.MACAddress = nic.MacAddress
					}
				}
			}
			inv.NetworkInterfaces = append(inv.NetworkInterfaces, nic)
		}
	}

	// Storage Drives
	partitions, err := disk.Partitions(true)
	if err != nil {
		log.Printf("Error getting disk partitions: %v", err)
	} else {
		for _, p := range partitions {
			usage, err := disk.Usage(p.Mountpoint)
			var total, used uint64
			if err == nil {
				total = usage.Total
				used = usage.Used

				if (runtime.GOOS == "windows" && p.Mountpoint == "C:") || (runtime.GOOS != "windows" && p.Mountpoint == "/") {
					inv.DiskUsage = float32(usage.UsedPercent)
				}
			}

			inv.StorageDrives = append(inv.StorageDrives, &sentpulsev1.StorageDrive{
				Name:       p.Mountpoint,
				Type:       p.Fstype,
				TotalBytes: total,
				UsedBytes:  used,
				Model:      p.Device,
			})
		}
	}

	// Processes
	procs, err := process.Processes()
	if err != nil {
		log.Printf("Error getting processes: %v", err)
	} else {
		count := 0
		for _, p := range procs {
			if count >= 30 {
				break
			}
			name, _ := p.Name()
			memInfo, _ := p.MemoryInfo()
			cpuPercent, _ := p.CPUPercent()
			username, _ := p.Username()

			if name == "" {
				continue
			}

			var memBytes uint64
			if memInfo != nil {
				memBytes = memInfo.RSS
			}

			inv.Processes = append(inv.Processes, &sentpulsev1.DeviceProcess{
				Pid:         int32(p.Pid),
				Name:        name,
				CpuPercent:  float32(cpuPercent),
				MemoryBytes: memBytes,
				User:        username,
				Status:      "running",
			})
			count++
		}
	}

	// Current User
	users, err := host.Users()
	if err != nil {
		log.Printf("Error getting users: %v", err)
	} else if len(users) > 0 {
		inv.CurrentUser = users[0].User
	}
	// Services
	svcs, err := CollectServices(context.Background())
	if err == nil {
		inv.Services = svcs
	} else {
		log.Printf("Error getting services: %v", err)
	}

	// Patches (Throttle to once per hour)
	if time.Since(lastPatchCollect) > 1*time.Hour || cachedPatches == nil {
		log.Println("Collecting patches...")
		patches, err := CollectPatches()
		if err == nil {
			cachedPatches = patches
			lastPatchCollect = time.Now()
		} else {
			log.Printf("Error getting patches: %v", err)
		}
	}
	inv.Patches = cachedPatches

	return inv, nil
}
