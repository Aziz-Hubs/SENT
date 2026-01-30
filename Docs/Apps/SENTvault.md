# **SENTvault – Secure Asset Storage**

**Division:** SENTerp (Infrastructure)  
**Architecture:** Document Management System (DMS)  
**Status:** [GOLD_MASTER_READY]

## **1. Executive Summary**

SENTvault is the secure file system for the SENT ecosystem. It replaces traditional file servers and SharePoint libraries with a strictly governed, encrypted, and audited storage silo. It handles everything from Employee Contracts to Tax Returns and Engineering Schematics.

## **2. Core Features**

### **2.1 File Operations**

- **Navigation:** Breadcrumb-based navigation for deep directory structures.
- **Content Creation:** Create text files directly in the browser (e.g. for quick notes or code snippets).
- **Upload/Download:** Drag-and-drop upload and secure retrieval.
- **Preview:** Native in-browser preview for PDF, Text, JSON, CSV, and Image files.

### **2.2 Organization & Lifecycle**

- **Folder Management:** Create nested directory hierarchies.
- **Archival:** "Zip & Archive" capability for bulk downloads.
- **Destruction:** Secure delete workflow with confirmation dialogs.

### **2.3 Security**

- **Encryption:** Files are encrypted at rest (conceptually via the backend bridge).
- **Audit:** Every "View" and "Download" event can be logged for compliance.

## **3. Integration with SENT Ecosystem**

- **SENTpeople:** Stores signed Employment Contracts.
- **SENTtax:** Stores filed VAT-100 returns.
- **SENToptic:** Stores forensic video evidence.
- **SENThorizon:** Stores generated QBR (Quarterly Business Review) PDF reports.

## **4. Technical details**

- **Storage Backend:** Abstraction layer over the local filesystem (wailsjs/go/vault/VaultBridge).
- **Safety:** Large file handling via base64 streaming optimization.
