# **SENTpilot (Security Edition) – Incident Response Platform**

**Division:** SENTsec (Security)  
**Architecture:** Ticket Workflow (Specialized View)  
**Status:** [GOLD_MASTER_READY]

## **1. Executive Summary**
SENTpilot (Sec) is a specialized configuration of the core SENTpilot engine, tailored specifically for Security Operations Centers (SOCs). While the MSP version focuses on Billing and SLA, the Security Edition focuses on Incident Response (IR) phases (Preparation, Detection, Analysis, Containment, Eradication, Recovery).

## **2. Technical Architecture**

### **2.1 The Interface**
*   **View:** "War Room" dashboard optimized for high-pressure incident management.
*   **Data Models:** Specialized fields for "Kill Chain Phase", "Attacker IP", "Compromised Asset".

## **3. Core Features**

### **3.1 Incident Management**
*   **Phases:** workflow steps strictly aligned with SANS/NIST IR frameworks.
*   **Evidence Locker:** Secure storage for malware samples and forensic artifacts (linked to SENTvault).

### **3.2 Collaboration**
*   **War Room Chat:** dedicated encrypted channel for analysts working the case.
*   **Task Lists:** Pre-built task checklists for different incident types (e.g., "Ransomware Checklist", "Business Email Compromise Checklist").

### **3.3 Metrics**
*   **MTTD / MTTR:** Auto-calculation of Mean Time to Detect and Mean Time to Respond.

## **4. Integration with SENT Ecosystem**
*   **SENTradar:** Automatically creates incidents from alerts.
*   **SENTreflex:** Allows analysts to trigger automation playbooks manually from the ticket interface.

## **6. Expanded Integration Scenarios**
*   **SENTlegal (Vault):** "Chain of Custody". Automates the logging of who accessed evidence files for legal proceedings.
*   **SENTshield:** "Post-Mortem". After an incident is closed, findings are pushed to SENTshield to update the Risk Register and Policy controls.
*   **SENTpeople:** "Call Tree". Shows the emergency contact numbers for the owners of the compromised system.
*   **SENTdeck:** "Report Generation". One-click export of the incident timeline into a slide deck for the management debrief.

## **7. Future Feature Roadmap**
*   **Breach Notification Timer:** Countdown clock for regulatory notification windows (e.g., "72 hours to notify GDPR authorities").
*   **Similar Incident Finder:** AI search to find past incidents that look like the current one.
*   **External Collaboration:** Secure portal to invite external forensic firms or law enforcement to collaborate on a ticket.
*   **Cost Calculator:** Estimates the financial cost of the breach in real-time (Downtime + Recovery costs).

## **8. Minimum Viable Product (MVP) Scope**
*   **Core Goal:** Track security incidents separately from IT tickets.
*   **In-Scope:**
    *   Incident Form (Type, Severity, Affected Assets).
    *   Timeline View (Comment stream).
    *   Status Workflow (Open -> Containment -> Closed).
    *   Secure Attachment Storage.
*   **Out-of-Scope (Phase 2):**
    *   Automation Triggers.
    *   War Room Chat.
    *   Metrics Dashboards.

## **10. Technical Design Document (TDD) - SENTpilot (Security Edition)**

### **10.1 Incident Response (IR) Platform**
SENTpilot (Sec) is a specialized configuration for Security Operations Centers (SOCs).
*   **IR Lifecycle Management:** Specialized workflows aligned with **NIST SP 800-61 r2**, tracking incidents through Detection, Containment, Eradication, and Recovery.
*   **Evidence Locker:** A secure, write-once-read-many (WORM) storage area for forensic artifacts, linked to SENTvault with **AES-GCM encryption** and strict chain-of-custody logging.

### **10.2 Security Operations Collaboration**
*   **War Room Engine:** Automated creation of encrypted SENTchat channels for every high-severity incident, inviting relevant analysts and stakeholders via Centrifugo.
*   **Chained Remediation:** Integration with **SENTreflex** and **SENTpulse** to execute multi-step containment playbooks (e.g., Isolate Host -> Capture RAM -> Kill Process) with stateful tracking.

### **10.3 Security Metrics**
*   **Detection & Response KPIs:** Automated calculation of Mean Time to Detect (MTTD) and Mean Time to Respond (MTTR) with data persistence in **TimescaleDB** for trend analysis.

## **11. Engineering Requirements & Quality Assurance**

### **11.1 Key Engineering Goals**
Developers must prioritize the following objectives to ensure the module meets SENT's enterprise standards:
*   **Goal:** Ensure seamless integration with the SENTcore unified data bus.
*   **Goal:** Deliver a polished, 'Native-feeling' UI experience with zero lag.

### **11.2 Mandatory Testing Suite**
No code will be merged into the SENTcore main branch without 100% passing of the following:
*   **Unit Testing (Go):** Comprehensive coverage of all service logic using `testing` and `testify`, focusing on edge cases in business rules.
*   **Integration Testing:** Validation of **Ent ORM** queries and schema relationships against a live PostgreSQL/TimescaleDB test instance.
*   **Frontend Testing:** Component-level testing with **Vitest** and end-to-end (E2E) workflow validation using **Playwright** via the Wails bridge.
*   **Security Testing:** Static analysis with `gosec` and mandatory OWASP Top 10 vulnerability checks on all input handlers.
*   **Spec:** Validate all CRUD operations against the Ent schema.
*   **Spec:** Verify state consistency across multiple app windows.

### **11.3 Performance & Reliability Benchmarks**
The following KPIs must be validated during the CI/CD pipeline:
*   **Latency:** Core API response time must remain below **50ms** for 95th percentile requests.
*   **Memory Footprint:** Idle RAM usage must not exceed **40MB** (excluding OS-level UI buffers).
*   **KPI:** App boot time < 1s.
*   **KPI:** UI thread frame rate > 60FPS.

### **11.4 Quality Assurance & Compliance Verification**
*   **Audit Logging:** Verify that every "Write" operation triggers a corresponding entry in the immutable audit hypertable.
*   **RBAC Enforcement:** Conduct "Negative Testing" to ensure users cannot access unauthorized resources or perform privileged actions.
*   **Dogfooding Certification:** The module must be validated against the internal SENT LLC operational use cases before release.
