# **SENTcal – Calendar & Scheduling**

**Division:** SENTerp (Business)  
**Architecture:** CalDAV Client  
**Status:** [DESIGN]

## **1. Executive Summary**
SENTcal is the master schedule. It handles personal agendas, team availability, and resource booking (conference rooms). It includes a built-in "Scheduling Link" feature (Calendly replacement) to allow external parties to book time without email back-and-forth.

## **2. Technical Architecture**

### **2.1 The Protocol**
*   **Standard:** CalDAV for syncing with Exchange, Google, and iCloud.
*   **Logic:** Conflict detection engine written in Go.

## **3. Core Features**

### **3.1 Calendar Views**
*   **Views:** Day, Week, Month, Year, and "Agenda" list.
*   **Overlay:** Toggle multiple calendars (Team, Personal, Holidays) to spot availability.

### **3.2 Booking System (Calendly Alt)**
*   **Public Links:** Generate `sent.link/user/15min` URLs.
*   **Rules:** Buffer times, maximum meetings per day, specific availability windows.

### **3.3 Resource Management**
*   **Room Booking:** Reserve physical spaces or equipment (Projectors, Cars).

## **4. Integration with SENT Ecosystem**
*   **SENTmeet:** Automatically generates video links for booked meetings.
*   **SENTpeople:** Tracks employee leave/vacation to block out calendars automatically.

## **6. Expanded Integration Scenarios**
*   **SENTmission:** "Project Timeline". Overlay project milestones and deadlines onto the main calendar view.
*   **SENTpilot:** "On-Call Schedule". Define who is on call for support tickets; SENTpilot uses this to route alerts.
*   **SENTcapital:** "Billable Events". Mark a calendar event as "Billable"; it flows to SENTcapital to generate an invoice.
*   **SENTkiosk:** "Room Display". Run SENTkiosk on a tablet outside a meeting room to show "Occupied until 2 PM" based on SENTcal data.

## **7. Future Feature Roadmap**
*   **Smart Scheduling:** "Find a Time". Analyze 5 people's calendars and suggest the best slot for a meeting.
*   **Travel Time:** Auto-add buffer time for travel if the location is physical (Google Maps integration).
*   **Weather:** Show weather forecast icons on the calendar days.
*   **Natural Language Entry:** Type "Lunch with Bob next Friday at noon" and it parses it correctly.

## **8. Minimum Viable Product (MVP) Scope**
*   **Core Goal:** View and Create events.
*   **In-Scope:**
    *   CalDAV Sync (Read/Write).
    *   Month/Week View.
    *   Event Creation (Title, Time, Description).
    *   Reminders (Notification).
*   **Out-of-Scope (Phase 2):**
    *   Public Booking Links.
    *   Room/Resource Booking.
    *   Smart Scheduling.



## **10. Technical Design Document (TDD)**

### **10.1 System Overview & Goals**
The primary objective of this module is to provide a high-availability, low-latency solution within the SENT ecosystem. This design prioritizes **composability**, **security by design**, and **observability**. Every component is built to be horizontally scalable and follows the "Principle of Least Privilege" (PoLP).

### **10.2 Component Architecture**
*   **Backend Services:** Built using **Go 1.24+** for performance and type safety. We utilize a **Hexagonal Architecture (Ports and Adapters)** to decouple business logic from external dependencies (databases, APIs).
*   **Frontend Interface:** A **React 19** application served via **Wails v2** (for desktop) or as a **PWA** (for web). State management is handled via **Zustand** for lightweight, performant stores.
*   **Worker Layer:** Background tasks and heavy processing are offloaded to **River** (Postgres-backed job queue), ensuring "at-least-once" delivery and transactional integrity.

### **10.3 Data Modeling & Persistence**
*   **Relational Storage:** **PostgreSQL** with the **Ent** framework for type-safe ORM and graph-like relationship management.
*   **Time-Series Data:** Where applicable (metrics/logs), we utilize **TimescaleDB** hypertables for efficient ingestion and retention management.
*   **Caching Layer:** **Redis** is used for session management, pub/sub messaging (via Centrifugo), and high-velocity ephemeral data.
*   **File Storage:** Abstracted via **Afero** to support local, S3, or Azure Blob storage without code changes.

### **10.4 API & Communication Strategy**
*   **Internal Communication:** Components communicate via **gRPC** for low-latency, strictly typed interactions.
*   **External API:** A robust **REST/GraphQL** gateway with automatic OpenAPI/Swagger documentation.
*   **Real-time Updates:** **WebSockets** (managed by Centrifugo) provide bi-directional updates for UI responsiveness.
*   **Event-Driven Hooks:** Comprehensive Webhook support with signed payloads for third-party integrations.

### **10.5 Security & Compliance Architecture**
*   **Identity & Access (IAM):** Unified authentication via **Zitadel** (OIDC/SAML). RBAC (Role-Based Access Control) is enforced at both the API and Database levels.
*   **Data Protection:** 
    *   **In-Transit:** Mandatory TLS 1.3 for all connections.
    *   **At-Rest:** AES-256-GCM encryption for PII and sensitive fields.
*   **Audit Logging:** Every write operation is recorded in an immutable audit trail, capturing the `ActorID`, `Action`, `Timestamp`, and `Delta`.

### **10.6 Infrastructure & Deployment (DevOps)**
*   **Containerization:** Full **Docker** support with multi-stage builds for minimal image size.
*   **Orchestration:** **Kubernetes** manifests and **Helm** charts for automated scaling and self-healing.
*   **CI/CD Pipeline:** Automated testing, linting, and security scanning on every commit. Blue-Green or Canary deployments are used to minimize downtime.
*   **Configuration:** "Twelve-Factor App" methodology using environment variables and secret managers (HashiCorp Vault).

### **10.7 Performance, Scalability & Reliability**
*   **Horizontal Scaling:** Stateless service design allowing for N-instance clusters.
*   **Load Balancing:** Nginx or HAProxy for intelligent traffic distribution.
*   **Database Optimization:** Strategic indexing, query profiling, and read-replicas for high-demand modules.
*   **Resiliency Patterns:** Implementation of **Circuit Breakers**, **Retries with Exponential Backoff**, and **Rate Limiting** to prevent cascading failures.

### **10.8 Observability & Operational Support**
*   **Logging:** Structured JSON logs sent to **SENTradar** (SIEM) and localized storage.
*   **Metrics:** Prometheus-compatible metrics endpoints for monitoring CPU, memory, and custom business KPIs.
*   **Tracing:** **OpenTelemetry** integration for distributed tracing across the ecosystem.
*   **Alerting:** Automated alerts via **SENTchat** and **SENTwave** for critical system health thresholds.

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
