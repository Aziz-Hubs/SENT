# **SENTemployee – Employee Self-Service Portal**

**Division:** SENTerp (Business)  
**Architecture:** Employee Front-End  
**Status:** [GOLD_MASTER_READY]

## **1. Executive Summary**

SENTemployee is the dedicated self-service portal for all staff members. It separates the "Employee Experience" from the "HR Admin Experience" (SENTpeople), providing a clean, focused interface for individuals to manage their career, time, and tasks without the clutter of administrative tools.

## **2. Technical Architecture**

- **Shared Core:** Built on the same high-performance `people.go` backend services as SENTpeople.
- **Security:** Role-Based Access Control (RBAC) ensures users can _only_ see their own data (Row-Level Security enforced via Ent privacy rules).
- **UI:** React 19 + ShadCN UI, utilizing the standard SENT design system for a cohesive experience.

## **3. Core Features**

### **3.1 Dashboard**

- **Welcome Center:** Personalized greeting and summary of pending actions (e.g., "Review your goals", "Approve pending leave").
- **Quick Actions:** One-click access to common tasks like requesting PTO or updating status.

### **3.2 Time Off (`TimeOffTab`)**

- **Request Portal:** Simple calendar interface for requesting vacation, sick leave, or parental leave.
- **Balance Visibility:** Clear visualization of available vs. used hours for each leave policy.
- **History:** Complete log of past and pending requests with status indicators.

### **3.3 Performance (`PerformanceTab`)**

- **My Goals:** Employee-driven goal setting (OKRs). Users can create goals, update progress (0-100%), and mark them as complete.
- **Reviews:** Access to past performance reviews and active self-evaluations.
- **Peer Feedback:** Invite colleagues for 360-degree feedback and track pending invitations.
- **Development:** Track personal development plans and training progress.

### **3.4 Benefits & Pay**

- **Open Enrollment:** Select and compare health, dental, and retirement plans during active election windows.
- **Payslip Archive:** View and download historical PDF pay stubs processed by the SENTpeople engine.
- **Expense Submission:** Upload receipts and submit reimbursement requests directly from mobile or desktop.

### **3.5 Learning & Growth (LMS)**

- **Course Dashboard:** Access mandatory training (security, compliance) and elective professional development.
- **Progress Tracking:** Real-time completion status and certificate downloads for finished modules.

## **4. Integration with SENT Ecosystem**

- **SENTpeople:** All data entered here (requests, goals) is immediately visible to HR admins in SENTpeople.
- **SENTpulse:** "On Leave" status syncs with the RMM to prevent alerts from inactive user accounts.
- **SENTcal:** Approved time-off automatically blocks the user's calendar in SENTmeet/SENTcal.

## **5. Future Roadmap**

- **AI Career Copilot:** Suggested training and internal job openings based on skills and performance data.
- **Team Management:** Simplified view for managers to handle direct report approvals and availability heatmaps.
- **Interactive Payslips:** Breakdown of tax deductions and benefit contributions with "what-if" modeling.
