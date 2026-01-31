# **SENTpulse – Remote Monitoring & Management (RMM)**

**Division:** SENTmsp (Infrastructure)  
**Architecture:** Distributed Agent System (Go-Sysinfo + Wails)  
**Status:** [GOLD_MASTER_READY]

## **1. Executive Summary**

SENTpulse is the heartbeat of the SENTmsp division. It is a high-performance, low-latency Remote Monitoring and Management (RMM) platform designed to provide real-time visibility into the health and performance of servers, workstations, and network devices. Unlike traditional RMMs that rely on heavy Java or .NET agents, SENTpulse utilizes a lightweight, native Go binary that runs silently in the background with minimal resource overhead.

## **2. Technical Architecture**

### **2.1 The Agent (The Pulse)**

- **Language:** Go (Golang) 1.24+
- **Deployment:** Native binary service (Systemd on Linux, Windows Service on Windows, LaunchDaemon on macOS).
- **Footprint:** <1% CPU usage, <20MB RAM idle.
- **Communication:** Secure WebSocket (WSS) connection to the SENTcore central server.
- **Telemetry Library:** `go-sysinfo` for hardware abstraction.

### **2.2 The Backend (The Heart)**

- **Ingestion:** TimescaleDB (PostgreSQL Extension) for high-velocity metrics (CPU, RAM, Network I/O).
- **Processing:** Real-time stream processing for alert triggering (e.g., "CPU > 90% for 5 mins").

### **2.3 The Frontend (The Monitor)**

- **Framework:** React 19 + Wails v2.
- **Visualization:** Real-time graphs using `Recharts` or `uPlot` for high-density time-series data.

## **3. Core Features**

### **3.1 Real-Time Telemetry**

- **Hardware Monitoring:** Live streaming of CPU temperature, fan speeds, voltage, disk S.M.A.R.T status, and RAM utilization.
- **Process Management:** Live task manager allowing the technician to kill runaway processes remotely without RDP.
- **Service Control:** Start, stop, and restart system services (Windows Services / Systemd units).
- **Antivirus Manager:** Real-time status reporting of Anti-virus software (e.g., Windows Defender) ensuring definitions are up-to-date and protection is active.

### **3.2 Automated Self-Healing (Automation Engine)**

- **Script Repository:** Centralized library (`ScriptRepository.tsx`) for managing PowerShell (.ps1) and Bash (.sh) scripts.
- **Job Scheduler:** `JobScheduler` component allows technicians to schedule scripts to run once or on a recurring Cron schedule (e.g., "Daily Cleanups at 3 AM").
- **Execution History:** Full audit log of script runs, output (stdout/stderr), and exit codes.
- **Scenarios:**
  - _Scenario:_ Print Spooler service crashes. -> _Action:_ Restart Service.
  - _Scenario:_ Disk space < 5%. -> _Action:_ Run cleanup script and clear temp folders.

### **3.3 Patch Management**

- **Windows Updates:** Native integration with Windows Update Agent (WUA) via COM interface (`patches_windows.go`).
- **Linux Updates:** Wrapper for `apt`, `dnf`, and `yum` package managers (`patches_linux.go`).
- **Patch Dashboard:** `PatchesTab` provides a unified view of missing updates (Critical, Security, Feature) with one-click install capability.
- **Third-Party Patching:** Integration with `winget` and `chocolatey` for keeping applications like Chrome, Zoom, and Adobe Reader up to date.

### **3.4 Remote Access**

- **Graphical Remote Desktop:** High-performance, low-latency screen sharing and remote control using native Go capture and WebSocket relay. Features variable framerate and full mouse/keyboard input injection (`robotgo`).
- **Terminal:** Fully interactive web-based terminal (`TerminalComponent.tsx`) using `xterm.js` and a custom Go PTY backend (`terminal.go`). Supports resize events and ANSI colors.
- **File Browser:** Remote file system navigation, upload, and download capabilities.

### **3.5 Network Monitoring (SNMP)**

- **Device Discovery:** Polls and monitors network devices (Switches, Firewalls, Printers) unrelated to the agent host.
- **Metrics:** Tracks Bandwidth (In/Out), Interface Status, and Device Uptime via SNMPv2c/v3.
- **Alerting:** Triggers alerts on specific OID values (e.g., "Printer Toner Low", "Switch Port Error Rate High").

### **3.6 System Power Actions**

- **Reboot:** One-click device restart directly from the dashboard.
- **Shutdown:** Graceful OS shutdown for maintenance windows.

### **3.7 Event Log Viewer**

- **Windows:** Pulls Error/Warning logs from the System Event Log using PowerShell.
- **Linux:** Fetches logs from `journalctl` with priority filter (Error/Warning).
- **Display:** Shows Timestamp, Level (color-coded), Source, and Message in a searchable table.

### **3.8 Environment Variables**

- **Full Listing:** Displays all system environment variables on the remote device.
- **Search/Filter:** Filter by key or value for quick troubleshooting.

## **4. Data Strategy**

- **Metric Storage:** All numerical telemetry is stored in **TimescaleDB** hypertables, partitioned by time and device ID.
- **Retention:** Raw data kept for 7 days; 1-hour rollups kept for 1 year for trend analysis.

## **5. Integration with SENT Ecosystem**

- **SENTpilot:** Automatically generates tickets when critical alerts (e.g., "Server Offline") are triggered.
- **SENTnexus:** Updates asset data (RAM, CPU model, Serial Number) in the documentation wiki automatically.
- **SENTvault:** Archives historical log data and terminal session recordings for forensic retention and compliance.

## **6. Expanded Integration Scenarios**

- **SENTpeople (HR):** Detects user login events and cross-references with "On Leave" status in SENTpeople. If an employee logs in while on vacation, an alert is triggered.
- **SENTstock (Inventory):** When a hard drive fails (S.M.A.R.T error), SENTpulse checks SENTstock for compatible replacement drives in the local office inventory and reserves one. Integrated telemetry also triggers preventative maintenance tasks in SENTstock when usage thresholds (e.g., SSD TBW) are exceeded.
- **SENToptic (CCTV):** If a server goes offline unexpectedly, SENTpulse triggers SENToptic to bookmark the video feed of the server room at that exact timestamp to check for physical tampering.
- **SENTreflex (SOAR):** Direct hook for advanced remediation. If SENTpulse detects ransomware behavior (mass file renames), it triggers a SENTreflex "Isolation Playbook" to cut network access.

## **7. Future Feature Roadmap**

- **Advanced Power Management:** "Wake-on-LAN" proxying. Use one online agent in a subnet to wake up other offline agents for nightly patching.
- **Software "Uninstall" Campaigns:** Ability to blacklist software (e.g., "Remove Spotify from all PCs"). The agent continuously checks for and uninstalls the target app.
- **User Sentiment Tracking:** A "How is your IT?" smiley-face popup that appears after high-resource usage events to correlate system performance with user frustration.
- **Offline Script Queuing:** Queue scripts for laptops that are currently offline; they execute immediately upon next reconnection.
