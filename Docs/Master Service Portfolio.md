# **SENT LLC \- Master Service Portfolio**

**Version:** 4.1 (Detailed Catalog)

**Architecture:** Unified Modular Monolith (Native Desktop)

## **1\. SENTmsp (Infrastructure Division)**

**Theme:** Visibility, Control, and Connection.

### **SENTpulse (Remote Monitoring & Management)**

- **Core Function:** Real-time health monitoring of servers and workstations.
- **Key Features:**
  - **Standalone Agent:** Lightweight `sent-agent` binary (Go-Sysinfo) with <1% CPU usage.
  - **Remote Support Toolkit:** Built-in **Graphical RDP**, Interactive Terminal, and Remote File Browser.
  - **Auto-Healing & Control:** Remote Service Manager, Process Killer, and System Power Actions (Reboot/Shutdown).
  - **Patch Management:** Integrated Windows Update (WUA) and Linux Package Manager (APT/DNF) control.
  - **TimescaleDB Ingest:** High-performance telemetry ingestion using `pgx` CopyFrom for 100k+ events/sec.
  - **Hybrid Caching:** Intelligent SQLite/Memory cache for offline telemetry buffering.
- **Tech Engine:** Go-Sysinfo + TimescaleDB + Centrifugo + Pion (WebRTC).

### **SENTpilot (Professional Services Automation)**

- **Core Function:** Intelligent ticketing and helpdesk management.
- **Key Features:**
  - **Chained Remediation:** One-click "Playbooks" that execute multi-step fixes via SENTpulse agents.
  - **SLA & Seniority Logic:** WIP limits and escalation workflows based on agent seniority and contract terms.
  - **Grace-Period Billing:** Automated time-entry reconciliation with flexible grace-period rounding.
- **Business Value:** Reduces "Ping-Pong" support conversations by 40% through automated triage.

### **SENTnexus (IT Documentation)**

- **Core Function:** The "Brain" of the IT department (Wiki/Knowledge Base).
- **Key Features:**
  - **Recursive Impact Engine:** 3-hop graph analysis to identify downstream dependencies (e.g., "If Switch X fails, which VMs go down?").
  - **AES-GCM Vault:** Hardware-encrypted credential storage with mandatory "Justification" logs for access.
  - **Data Certification:** Automated worker that flags stale documentation for review.
- **Business Value:** Eliminates tribal knowledge; makes technician onboarding instant.

### **SENThorizon (vCIO & Strategy)**

- **Core Function:** Strategic IT planning and lifecycle management.
- **Key Features:**
  - **Holistic Health Score:** 0-100 algorithm weighted by Performance (40%), Security (40%), and Lifecycle (20%).
  - **Maroto QBR Reports:** Automated generation of pixel-perfect PDF Quarterly Business Reviews.
  - **Budget Forecasting:** 3-year refresh roadmaps based on asset lifecycle telemetry.

### **SENTcontrol (SaaS Management)**

- **Core Function:** Management of cloud subscriptions (M365, Workspace).
- **Key Features:**
  - **Native SDK Integration:** Direct connectors for Microsoft Graph and Google Admin SDKs.
  - **SNI-Based Filtering:** TLS-level blocking of unauthorized SaaS applications via SENTgrid/SENTguard.
  - **Automated Downgrade:** Identifies and downgrades underutilized premium licenses (e.g., E5 to E3).

### **SENToptic (CCTV Surveillance)**

- **Core Function:** Network Video Recorder (NVR) and AI-enhanced surveillance.
- **Key Features:**
  - **Pion/WebRTC Signaling:** Low-latency 4K streaming directly to the desktop app via MediaMTX.
  - **TFLite Local Inference:** On-device person/object detection using quantized INT8 models (no cloud required).
  - **ROI Smart Search:** Search for motion events within specific "Regions of Interest" across the timeline.
- **Tech Engine:** MediaMTX \+ Pion \+ TFLite.

### **SENTgrid (Network Management)**

- **Core Function:** Network infrastructure orchestration and configuration.
- **Key Features:**
  - **SSH Worker Pool:** High-concurrency SSH/Telnet pool for mass configuration deployment.
  - **TextFSM Normalization:** Converts raw CLI output from 50+ vendors into structured JSON.
  - **Recursive Topology:** Automated L2/L3 map generation using LLDP/CDP/ARP table analysis.

## **2\. SENTsec (Security Division)**

**Theme:** Defense, Detection, and Reflex.

### **SENTradar (SIEM & Log Analysis)**

- **Core Function:** Centralized log aggregation and threat detection.
- **Key Features:**
  - Ingests logs from Windows Event Viewer, Syslog, and Firewalls.
  - Real-time Sigma rule matching for anomaly detection.
  - Forensic timeline search.
- **Tech Engine:** Expr \+ Sigma (Isolated Worker Mode).

### **SENTguard (Endpoint Detection & Response)**

- **Core Function:** Active endpoint protection and threat hunting.
- **Key Features:**
  - Process killing and network isolation for infected hosts.
  - File integrity monitoring.
  - Ransomware canary files.
- **Tech Engine:** Gopacket (Packet Capture).

### **SENTshield (GRC & Compliance)**

- **Core Function:** Automated governance, risk, and compliance reporting.
- **Key Features:**
  - One-click ISO 27001 / GDPR gap analysis.
  - Automated PDF report generation.
  - Vendor risk assessment questionnaires.
- **Tech Engine:** Maroto (PDF Generation).

### **SENTmind (Phishing Simulation)**

- **Core Function:** Employee security awareness training.
- **Key Features:**
  - Simulated phishing email campaigns.
  - "Teachable Moments" landing pages for failed tests.
  - Training progress tracking.
- **Tech Engine:** Gophish (Architecture Reference).

### **SENTprobe (Vulnerability Scanner)**

- **Core Function:** Continuous identification of network weaknesses.
- **Key Features:**
  - External IP scanning (Ports, CVEs).
  - Internal network scanning (Weak passwords, unpatched OS).
  - Automated remediation ticket creation.
- **Tech Engine:** Nuclei.

## **3\. SENTerp (Business Division)**

**Theme:** Efficiency, Flow, and Truth.

### **Productivity Suite**

- **SENTmail:** Native IMAP/SMTP client with unified inbox and deep search. (Go-IMAP)
- **SENTchat:** Corporate messaging with channels, threads, and file sharing. (Centrifugo)
- **SENTmeet:** HD Video conferencing with screen sharing and recording. (Pion WebRTC)
- **SENTsheet:** Full-featured spreadsheet editor compatible with .xlsx. (Univer)
- **SENTscribe:** Collaborative rich-text document editor (Wiki/SOPs).
- **SENTdeck:** Slide presentation builder and presenter.

### **Business Operations**

- **SENTcapital (Finance):** Multi-currency general ledger, AP/AR, and automated bank reconciliation. (Shopspring/Decimal)
- **SENTorbit (CRM):** Sales pipeline management, lead scoring, and contact enrichment.
- **SENTmission (Projects):** Project management with Gantt charts, Kanban boards, and resource loading. (SVAR Gantt)
- **SENTpeople (HR):** Employee lifecycle, ATS (Recruiting), 360 Feedback, Benefits Admin, LMS, and multi-currency Gross-to-Net payroll. (Maroto v2)
- **SENTstock (Inventory):** Barcode-based asset tracking, full lifecycle management (Maintenance, Warranty, Depreciation), procurement workflows (POs), and authoritative cycle counting. (React-Zxing)
- **SENTbridge (GovTech):** Integration with JoFotara/Government tax gateways for compliant invoicing. (Go XML)
- **SENTvault (DMS):** Secure file storage with version control and permission management. (Afero)
- **SENTwave (Voice):** Cloud VoIP with SIP-over-WebSocket, Pion WebRTC softphone, and Visual IVR DAG logic. (Pion)
