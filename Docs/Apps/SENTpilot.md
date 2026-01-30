# **SENTpilot – Professional Services Automation (PSA)**

**Division:** SENTmsp (Services)  
**Architecture:** PSA / Helpdesk Engine  
**Status:** [GOLD_MASTER_READY]

## **1. Executive Summary**
SENTpilot is the operational cockpit for Managed Service Providers (MSPs). It serves as the companion to SENTpulse (RMM), handling the "Human" side of IT management: Tickets, Projects, and Service Level Agreements (SLAs). While SENTpulse handles the machines, SENTpilot handles the work.

## **2. Core Features**

### **2.1 Service Desk (Ticketing)**
*   **Ticket Management:** Kanban and List views for managing support incidents.
*   **SLA Tracking:** Real-time countdown timers for Response and Resolution SLAs.
*   **Priority Queues:** Automated routing of Critical/High priority tickets to tier-3 engineers.
*   **Integration:** Tickets can be created automatically from SENTpulse alerts (e.g., "Server Offline").

### **2.2 Project Management**
*   **Project Tracking:** Manage long-term initiatives (e.g., "Office 365 Migration").
*   **Gantt/Timeline:** Visual progress tracking against deadlines.
*   **Resource Allocation:** Assign technicians to projects and track utilization.

### **2.3 Client Management**
*   **Client Portal:** (Planned) Self-service portal for clients to log tickets.
*   **Contract Management:** Track Retainer vs. T&M contracts.

## **3. Integration with SENT Ecosystem**
*   **SENTpulse:** Two-way sync. A resolved ticket in Pilot can trigger a script in Pulse. An alert in Pulse creates a ticket in Pilot.
*   **SENTcapital:** Billable time logged on tickets is pushed to SENTcapital for invoicing.
*   **SENTpeople:** Technician availability and skills are synced from HR records.

## **4. Future Roadmap**
*   **AI Triage:** Auto-categorize tickets and suggest solutions based on historical data.
*   **Customer Satisfaction (CSAT):** Automated surveys sent upon ticket closure.
*   **Knowledge Base:** Integrated wiki for solution articles (linked to tickets).
