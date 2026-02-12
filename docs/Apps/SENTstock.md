# **SENTstock – Inventory & Warehouse ERP**

**Division:** SENTerp (Business)  
**Architecture:** Supply Chain Engine  
**Status:** [GOLD_MASTER_READY]

## **1. Executive Summary**

SENTstock is the definitive ledger for physical assets. It manages the flow of goods from "Procurement" to "Sale". It is designed for high-velocity environments, supporting barcode scanning, real-time stock adjustments, and multi-location aisle tracking.

## **2. Core Features**

### **2.1 Professional Asset Management**

- **Serial Number Tracking:** Authoritative tracking of individual items via unique serial keys.
- **Location Mapping:** Real-time association with physical locations (Warehouses, Aisles, Bins).
- **Asset Disposal:** Formal decommission workflow with reason tracking (Damaged, EOL, Sold).

### **2.2 Financial & Lifecycle Compliance**

- **Financial Valuation:** Automatic **Straight-Line Depreciation** logic calculates Net Current Value based on useful life and acquisition cost.
- **Warranty Management:** Tracking of expiration dates with automated alerts for upcoming expirations.
- **Maintenance Scheduling:** Preventative maintenance engine for scheduling, tracking, and completing recurring service tasks.

### **2.3 Procurement & Supply Chain**

- **Purchase Orders (PO):** Complete procurement lifecycle from Draft to Issued.
- **Authoritative Intake:** "Receive PO" workflow that automatically updates stock levels and updates audit trails.
- **Supplier Directory:** Integrated management of vendors and procurement history.

### **2.4 Inventory Integrity**

- **Physical Cycle Counts:** Formal inventory counting tools to verify system accuracy and track variance.
- **Audit Logging:** Immutable, tenant-scoped ledger of every stock movement, status change, and administrative action.
- **Bulk Operations:** High-performance CSV import engine for rapid multi-SKU catalog ingestion.

## **3. Integration with SENT Ecosystem**

- **SENTkiosk:** The POS draws real-time availability from the master stock ledger.
- **SENTcapital:** Inventory value is synced to the Balance Sheet; Depreciation is automatically recorded in the General Ledger.
- **SENThorizon:** Asset lifecycle data (warranty/age) informs 3-year refresh roadmaps and strategic budgeting.
- **SENTpilot:** Support tickets can be linked directly to hardware assets from the Stock ledger for forensic tracking.
- **SENTpulse:** Automated hardware discovery updates serial numbers and BIOS versions in the Stock records.

## **4. Future Roadmap**

- **Mobile Logistics:** Dedicated React Native app for warehouse pickers with built-in camera scanning.
- **Predictive Restocking:** AI-driven forecasting based on historical Kiosk sales and Pilot project timelines.
