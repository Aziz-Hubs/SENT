# **SENTbridge – Government & Tax Integration**

**Division:** SENTerp (Business)  
**Architecture:** XML/SOAP/API Gateway  
**Status:** [STABLE]

## **1. Executive Summary**
SENTbridge is the localization layer. It connects SENTcapital to government tax portals (e.g., JoFotara in Jordan, ZATCA in KSA, HMRC in UK). It ensures that every invoice generated is compliant with local e-invoicing regulations.

## **2. Technical Architecture**

### **2.1 The Adapter Pattern**
*   **Drivers:** Country-specific Go packages (e.g., `pkg/jofotara`, `pkg/zatca`) that implement a common `TaxProvider` interface.
*   **Cryptography:** Handles digital signing (HSM integration) and QR code generation required by tax authorities.

## **3. Core Features**

### **3.1 E-Invoicing & Compliance**
*   **Real-time Clearance:** Submits invoices to the tax authority API before sending to the client.
*   **Digital Signing:** Implemented a cryptographic signing engine using **SHA-256 hashing** to provide invoice integrity for ZATCA (KSA) and JoFotara (Jordan) compliance.
*   **Validation:** Checks VAT numbers and address formats.

### **3.2 Tax Calculation & Simulation**
*   **Global Engine:** Multi-region simulator supporting:
    *   **Jordan (JO):** 16% standard VAT.
    *   **Saudi Arabia (SA):** 15% standard VAT.
    *   **UAE (AE):** 5% standard VAT.
    *   **United Kingdom (GB):** 20% standard VAT.
*   **Dynamic Lookup:** Real-time lookup of regional rates and fiscal status.

### **3.3 Reporting**
*   **VAT Return:** Auto-fills tax return forms based on ledger data.
*   **Audit File:** Exports SAF-T (Standard Audit File for Tax) XMLs.

## **4. Integration with SENT Ecosystem**
*   **SENTcapital:** Intercepts the "Send Invoice" action to perform tax clearance and signature attachment.

## **6. Expanded Integration Scenarios**
*   **SENTpeople:** "Social Security". Submits employee salary data to government social security portals.
*   **SENTvault:** "Audit Archiving". Stores the XML response files from the government as legal proof of submission.
*   **SENTpilot:** "Billing Block". Prevents closing a ticket or sending a bill if the client's Tax ID is missing or invalid.

## **7. Future Feature Roadmap**
*   **Global Tax Engine:** Support for 50+ countries.
*   **OCR Import:** Scan incoming vendor invoices and check them against the government portal to verify they are legitimate.
*   **Customs Integration:** Submit declaration forms for imported hardware (linked to SENTstock).
*   **Live Status Dashboard:** Monitor the health of government API endpoints.

## **8. Minimum Viable Product (MVP) Scope**
*   **Core Goal:** Submit one invoice to one authority (e.g., JoFotara).
*   **In-Scope:**
    *   XML Serializer (specific to country).
    *   HTTP Client with Mutual TLS (mTLS).
    *   QR Code Generator.
    *   Status Update (Pending -> Cleared -> Rejected).
*   **Out-of-Scope (Phase 2):**
    *   VAT Return Filing.
    *   Social Security.
    *   Multi-country support.




## **10. Technical Design Document (TDD)**

### **10.1 Architectural Infrastructure**
This module is a high-performance component of the **SENT Unified Monolith**, leveraging a single-binary distribution strategy for cross-platform deployment (Windows, macOS, Linux).
*   **Core Engine:** Compiled **Go 1.24+** backend utilizing a modular service architecture.
*   **UI Layer:** **React 19** frontend served via **Wails v2**, ensuring native performance with web-standard styling (Tailwind CSS).
*   **State Management:** Lightweight, high-performance state handling using **Zustand** and **Immer**.
*   **Communication:** Internal function-call routing for inter-app telemetry and **Centrifugo** for real-time WebSocket events.

### **10.2 Data Persistence & Schema**
*   **Relational Model:** **PostgreSQL** with **Ent ORM** for strictly-typed, graph-aware relationship management.
*   **Time-Series Core:** Integrated **TimescaleDB** hypertables for performance-critical metrics and high-volume audit logs.
*   **Caching Strategy:** Multi-level caching using in-memory Go maps and **Redis** for distributed state across the monolith's worker nodes.

### **10.3 Module-Specific Engineering**
* **Tax Engine:** **Go XML** serializer for government tax gateway (JoFotara) compliance.
* **Validation:** Real-time invoice validation against government e-invoicing standards.
* **Reporting:** Automatic tax filing and audit file generation.

### **10.4 Ecosystem Integration & Operational Context**
As part of the **SENTcore** "Dogfooding" initiative, this app is a critical dependency for SENT LLC's daily operations:
*   **Operational Role:** Used for filing SENT's internal corporate taxes with government authorities.
*   **Inter-App Synergy:** Real-time data sharing with other SENT modules (e.g., **SENTvault** for file persistence, **SENTchat** for alerts) via the centralized internal message bus.

### **10.5 Security, Compliance & Audit**
*   **Identity:** Unified authentication via **Zitadel** (OIDC), enforcing granular Role-Based Access Control (RBAC).
*   **Protection:** Mandatory **AES-256-GCM** encryption for all sensitive fields at rest and **TLS 1.3** for all internal and external communication.
*   **Auditability:** Every transaction is recorded in an immutable audit hypertable, including the actor, delta, and cryptographic hash for non-repudiation.

### **10.6 Performance & Lifecycle Management**
*   **Scalability:** Stateless horizontal scaling of worker processes, managed by the core SENT scheduler.
*   **Observability:** Full-stack tracing via **OpenTelemetry** and real-time health monitoring via **Prometheus** endpoints.
*   **CI/CD:** Automated testing suites (Unit, Integration, E2E) required for every build, ensuring 99.99% system uptime.

## **11. Engineering Requirements & Quality Assurance**

### **11.1 Key Engineering Goals**
Developers must prioritize the following objectives to ensure the module meets SENT's enterprise standards:
*   **Goal:** Maintain 100% compliance with JoFotara/ZATCA XML schema standards.
*   **Goal:** Ensure non-repudiation of government-signed invoice responses.

### **11.2 Mandatory Testing Suite**
No code will be merged into the SENTcore main branch without 100% passing of the following:
*   **Unit Testing (Go):** Comprehensive coverage of all service logic using `testing` and `testify`, focusing on edge cases in business rules.
*   **Integration Testing:** Validation of **Ent ORM** queries and schema relationships against a live PostgreSQL/TimescaleDB test instance.
*   **Frontend Testing:** Component-level testing with **Vitest** and end-to-end (E2E) workflow validation using **Playwright** via the Wails bridge.
*   **Security Testing:** Static analysis with `gosec` and mandatory OWASP Top 10 vulnerability checks on all input handlers.
*   **Spec:** Automated XSD validation for every generated XML payload.
*   **Spec:** Mock government API failure tests to verify SENTbridge's retry and idempotency logic.

### **11.3 Performance & Reliability Benchmarks**
The following KPIs must be validated during the CI/CD pipeline:
*   **Latency:** Core API response time must remain below **50ms** for 95th percentile requests.
*   **Memory Footprint:** Idle RAM usage must not exceed **40MB** (excluding OS-level UI buffers).
*   **KPI:** XML serialization time < 5ms.
*   **KPI:** 100% success rate for QR code scan validation.

### **11.4 Quality Assurance & Compliance Verification**
*   **Audit Logging:** Verify that every "Write" operation triggers a corresponding entry in the immutable audit hypertable.
*   **RBAC Enforcement:** Conduct "Negative Testing" to ensure users cannot access unauthorized resources or perform privileged actions.
*   **Dogfooding Certification:** The module must be validated against the internal SENT LLC operational use cases before release.
