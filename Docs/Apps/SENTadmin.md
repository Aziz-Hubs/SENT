# **SENTadmin – Ecosystem Governance**

**Division:** Core / Kernel  
**Architecture:** Multi-Tenancy & Identity Management  
**Status:** [GOLD_MASTER_READY]

## **1. Executive Summary**

SENTadmin is the "God Mode" console for the SENT ecosystem. It handles the creation and management of **Tenants** (Organizations) and **Identities** (Users). It provides system-wide visibility into user counts, storage usage, and security events.

## **2. Core Features**

### **2.1 Directory Management**

- **Tenant Provisioning:** Create new Organizations (Tenants) with isolated data schemas.
- **User Provisioning:** Create and invite users, assign them to Tenants, and define their roles (Admin, User, Auditor).
- **Lifecycle Management:** Suspend/Revoke access for users or entire organizations instantly.

### **2.2 Security & Auditing**

- **Global Kill Switch:** Ability to terminate user sessions immediately across all apps.
- **Security Audit Log:** A real-time stream of high-priority system events (e.g., "Kernel heartbeat verified", "Intrusion detection").
- **Safety Interlocks:** Destructive actions (like deleting an Org) require explicit "CONFIRM" typing to prevent accidents.

### **2.3 System Stats**

- **Usage Metrics:** Real-time tracking of Global User Count and Total Organizations.
- **Storage Quotas:** Monitoring of storage consumption per tenant.

## **3. Integration with SENT Ecosystem**

- **SENTpeople:** Imports user details from the HRIS to auto-provision accounts.
- **SENTguard:** Feeds security alerts (e.g., "Compromised Device") into the Sentinel Admin log.
- **SENTcontrol:** Provides the SaaS usage data that Admin uses for license reporting.

## **4. Technical Architecture**

- **Identity Provider:** Wraps **Zitadel** OIDC for standard authentication flow.
- **Kernel Bridge:** Direct communication with the Go backend for privileged operations (Org creation, Database migration).
