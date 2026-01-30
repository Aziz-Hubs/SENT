# **SENTorbit – CRM & Sales**

**Division:** SENTerp (Business)  
**Architecture:** Relationship Manager  
**Status:** [DESIGN]

## **1. Executive Summary**
SENTorbit manages the customer journey from "Suspect" to "Raving Fan". It tracks leads, deals, and contacts. Unlike standalone CRMs (Salesforce, HubSpot), it has full visibility into the client's support tickets and financial status.

## **2. Technical Architecture**

### **2.1 Data Enrichment**
*   **Scrapers:** Background workers that fetch public info (LinkedIn, Company Website) to enrich contact profiles.

## **3. Core Features**

### **3.1 Pipeline Management**
*   **Visual Board:** Drag-and-drop deal stages (Prospecting -> Proposal -> Negotiation -> Closed Won).
*   **Probability:** Weighted revenue forecasting.

### **3.2 Communication**
*   **Timeline:** Unified view of all Emails (SENTmail), Calls (SENTwave), and Meetings (SENTmeet) with the client.
*   **Sequences:** Drip email campaigns for lead nurturing.

### **3.3 Quoting (CPQ)**
*   **Builder:** Drag-and-drop quote builder.
*   **E-Sign:** Integrated digital signature collection.

## **4. Integration with SENT Ecosystem**
*   **SENTcapital:** Converts "Won" quotes into Invoices.
*   **SENTpilot:** Handover from Sales to Support (Support team sees what was sold).

## **6. Expanded Integration Scenarios**
*   **SENTcanvas:** "Visitor Tracking". Identifies which companies are visiting the corporate website and creates leads automatically.
*   **SENTprism:** "Sales Performance". Dashboards comparing Sales Reps against targets.
*   **SENTscan (Kiosk):** "Event Badge Scan". Scan a business card or badge at a trade show via the mobile app to create a contact.
*   **SENTnexus:** "Tech Fit". Shows the sales rep what technology the prospect is currently using (discovered via SENTprobe) to help tailor the pitch.

## **7. Future Feature Roadmap**
*   **AI Call Coach:** Listens to sales calls (via SENTwave) and gives real-time tips ("You're talking too fast", "Mention the discount").
*   **Territory Management:** Auto-assign leads based on geographic zip codes.
*   **Competitor Battlecards:** Pop-up cheat sheets when a competitor is mentioned.
*   **Commission Calculator:** Real-time tracking of sales commissions.

## **8. Minimum Viable Product (MVP) Scope**
*   **Core Goal:** Manage Contacts and Deal Pipeline.
*   **In-Scope:**
    *   Contact/Company Database (CRUD).
    *   Deal Pipeline (Kanban).
    *   Activity Logging (Notes, Calls).
    *   Basic Search.
*   **Out-of-Scope (Phase 2):**
    *   Email Sequences/Drip Campaigns.
    *   Quote Builder (CPQ).
    *   Data Enrichment Scrapers.
    *   LinkedIn Integration.

## **10. Technical Design Document (TDD) - SENTorbit**

### **10.1 Relationship Management Engine**
SENTorbit is built as a **High-Performance CRM** focused on data enrichment and pipeline visibility.
*   **Pipeline Logic:** A state-machine based deal tracker that enforces mandatory fields before moving to the next stage (e.g., "Must attach Quote before Negotiation stage").
*   **Data Enrichment Scraper:** Background workers that fetch public company data and LinkedIn profiles to auto-populate lead information.

### **10.2 Sales Automation (CPQ)**
*   **Quote Builder:** A drag-and-drop interface for building complex quotes using items from SENTstock, with real-time tax calculation via SENTbridge.
*   **E-Sign Workflow:** Integration with a secure PDF signing service, tracking the document status from "Sent" to "Fully Executed."

### **10.3 Communication Timeline**
*   **Unified Activity Feed:** A chronological stream aggregating SENTmail threads, SENTwave call logs, and SENTmeet transcripts for a 360-degree customer view.

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
