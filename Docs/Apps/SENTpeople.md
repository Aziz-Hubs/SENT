# **SENTpeople – HR & Payroll**

**Division:** SENTerp (Business)  
**Architecture:** HRIS Engine  
**Status:** [GOLD_MASTER_READY]

## **1. Executive Summary**

SENTpeople is the Human Resources Information System (HRIS). It manages the employee lifecycle from "Hire to Retire". It handles org charts, time off, performance reviews, engagement surveys, and payroll processing.

## **2. Technical Architecture**

### **2.1 Security & Unified Identity**

- **Encryption:** PII (Personally Identifiable Information) like Salaries and Bank Details are encrypted at rest using **AES-256-GCM** via the `pkg/crypto` module.
- **Unified Identity Mapping:** Implementation of a GIN-indexed **external_mappings** JSONB store, facilitating sub-50ms unified lookups across M365, Google Workspace, and internal records.
- **Atomic Activation:** The activation workflow treats Zitadel user creation and local status updates as an atomic operation to prevent "Zombie Accounts."

### **2.2 Precision Payroll**

- **Engine:** Multi-currency Gross-to-Net engine using **shopspring/decimal** for fixed-point accuracy.
- **Localization:** Integrated exchange rate service from SENTcapital for JOD/SAR/USD conversions with standardized **Half-Up Rounding** governance.

## **3. Core Features**

### **3.1 Core HR & Identity**

- **Directory:** Searchable employee list with **STAGED**, **ACTIVE**, and **TERMINATED** lifecycle states.
- **Org Chart:** High-performance visualization using **React Flow**, supporting 1,000+ nodes at 60FPS.
- **Onboarding Portal:** Digital signature gate featuring a React signature canvas and metadata verification (IP/Timestamp/Hash).

### **3.2 Time & Attendance**

- **Time Off Management:** Dedicated `TimeOffTab` for managing leave balances (PTO, Sick, Unpaid).
  - **Policies:** configurable accrual rules per tenant (`TimeOffPolicy`).
  - **Balances:** Real-time balance tracking with year-end carry-over logic.
  - **Approval Workflow:** Manager review portal for approving/rejecting requests.
- **Clock:** Geo-fenced clock-in/clock-out for hourly staff.

### **3.3 Performance Management**

- **Reviews:** Quarterly and Annual review cycles (`ReviewCycle`) with self-evaluation and manager assessment.
- **Goals:** `PerformanceTab` allows employees to set and track OKRs and KPIs.
- **Rating System:** Standardized 1-5 rating scale with weighted scoring for compensation planning.
- **Feedback:** Continuous feedback loop between managers and direct reports.

### **3.4 Employee Engagement (SENTengagement)**

- **Pulse Surveys:** Real-time sentiment tracking across teams.
- **Burnout Risk:** Analytical models to detect signs of burnout (workload, sentiment trends).
- **Team Insights:** Managers get a dashboard of their team's health and response rates.

### **3.5 Succession Planning**

- **Succession Mode:** Toggleable overlay on the Org Chart to identify **High-Potential (HiPo)** employees.
- **Candidate Mapping:** Visual mapping of backup candidates with readiness levels (Emergency, Ready 1 Year, Ready 2 Year).

### **3.6 Contract Pipeline**

- **PDF Generation:** Automated employment contract generation using **Maroto v2**, merging captured signatures and cryptographic verification hashes.
- **Vault Integration:** Signed contracts are automatically versioned and stored in **SENTvault**.

### **3.7 Payroll**

- **Processing:** Calculation of Gross-to-Net pay, tax deductions, and benefits.
- **Payslips:** PDF payslip generation and email delivery.

## **4. Integration with SENT Ecosystem**

- **SENTcontrol:** Auto-provisions accounts when a new user is added.
- **SENTcapital:** Posts payroll expenses to the ledger.
- **SENTmind:** Enrolls new hires in security training.

## **6. Expanded Integration Scenarios**

- **SENTaccess:** "Alumni Portal". Terminated employees retain limited access to download past payslips and tax forms.
- **SENTmission:** "Capacity Planning". Blocks project assignment if the user has approved leave during the project dates.
- **SENTpilot:** "Ticket Routing". Tickets from the CEO are flagged as VIP because of their role in the Org Chart.
- **SENTwave:** "Emergency Blast". Uses employee cell phone numbers to send SMS alerts during a crisis.

## **7. Future Feature Roadmap**

- **360 Reviews:** Peer-to-peer performance feedback collection.
- **Benefits Administration:** Portal for employees to choose health insurance plans.
- **Applicant Tracking System (ATS):** Manage job postings and resumes before they become employees.
