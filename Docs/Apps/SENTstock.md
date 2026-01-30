# **SENTstock – Inventory & Warehouse ERP**

**Division:** SENTerp (Business)  
**Architecture:** Supply Chain Engine  
**Status:** [GOLD_MASTER_READY]

## **1. Executive Summary**

SENTstock is the definitive ledger for physical assets. It manages the flow of goods from "Procurement" to "Sale". It is designed for high-velocity environments, supporting barcode scanning, real-time stock adjustments, and multi-location aisle tracking.

## **2. Core Features**

### **2.1 Inventory Management**

- **Product Catalog:** Comprehensive SKU management with tracking for Unit Cost, Quantity, and Reserved Stock.
- **Real-Time Adjustments:** "Incoming" (Receiving) and "Outgoing" (Shrinkage/Usage) workflows.
- **Low Stock Alerts:** Automated visual warnings when stock dips below reorder points.

### **2.2 Warehouse Operations**

- **Barcode Scanning:** HID-compliant scanner integration. Supports rapid "Scan-to-Search" and "Scan-to-Add".
- **Barcode Generation:** Built-in generator to print QR/Barcodes for unlabeled items.
- **Location Tracking:** Aisle-level granularity (e.g., "Aisle 3") to help pickers find items fast.

### **2.3 Reporting**

- **Value Valuation:** Real-time calculation of total inventory asset value.
- **CSV Export:** One-click export of the entire inventory ledger for external auditing.

## **3. Integration with SENT Ecosystem**

- **SENTkiosk:** The POS system draws its product data directly from SENTstock. Sales in Kiosk immediately deduct inventory in Stock.
- **SENTcapital:** Inventory value is synced to the Balance Sheet as a Current Asset.
- **SENTpulse:** Hardware usage (e.g., deploying a laptop to a user) deducts it from Stock.

## **4. Future Roadmap**

- **Mobile App:** Dedicated warehouse picker app for tablets.
- **Supplier Portal:** Allow vendors to upload ASNs (Advance Shipping Notices) directly.
