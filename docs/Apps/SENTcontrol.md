# **SENTcontrol – SaaS Management Platform (SMP)**

**Division:** SENTsec (Security)  
**Architecture:** SaaS Discovery & Governance Engine  
**Status:** [GOLD_MASTER_READY]

## **1. Executive Summary**

SENTcontrol is the "FinOps" and "SecOps" engine for SaaS applications. It helps organizations discover "Shadow IT" (unauthorized apps), optimize license spending (downgrading unused premium licenses), and enforce security compliance (MFA adoption) across the SaaS estate.

## **2. Core Features**

### **2.1 Managed Inventory**

- **Central Catalog:** Tracks all sanctioned SaaS applications (Microsoft 365, Google Workspace, Zoom, etc.).
- **Spend Tracking:** Monitors monthly costs and license utilization.
- **Health Status:** Real-time connection status to SaaS APIs.

### **2.2 Shadow Discovery**

- **Forensic Correlation:** improved discovery engine that correlates **SENTcapital** financial records (credit card charges) with **SENTgrid** flow logs (network traffic) to identify unmanaged apps (e.g., "Dropbox", "ChatGPT Personal", "Netflix").
- **Risk Scoring:** Assigns a risk score (0-100) to discovered apps based on data sensitivity and usage frequency.

### **2.3 FinOps & Optimization**

- **Automated Downgrades:** Policy engine that automatically downgrades users from Premium tiers (e.g., E5) to Standard tiers (e.g., E3) if advanced features haven't been used in 60 days.
- **Savings Calculator:** Visualizes ROI from license reclamation.

## **3. Integration with SENT Ecosystem**

- **SENTgrid:** Provides network flow logs for Shadow IT discovery.
- **SENTcapital:** Provides expense data to find software purchases on corporate cards.
- **SENTadmin:** Can revoke access to unauthorized SaaS apps via identity management.

## **4. Future Roadmap**

- **CASB Lite:** Inline blocking of high-risk SaaS apps via the SENTgrid firewall integration.
- **Contract Renewal Alerts:** AI-predicted renewal dates to prevent auto-renew surprises.
