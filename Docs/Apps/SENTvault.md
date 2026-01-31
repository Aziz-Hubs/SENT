# **SENTvault – Secure Asset Storage**

**Division:** SENTerp (Infrastructure)  
**Architecture:** Document Management System (DMS)  
**Status:** [GOLD_MASTER_READY]

## **1. Executive Summary**

SENTvault is the secure file system for the SENT ecosystem. It replaces traditional file servers and SharePoint libraries with a strictly governed, encrypted, and audited storage silo. It handles everything from Employee Contracts to Tax Returns and Engineering Schematics.

## **2. Core Features**

### **2.1 Intelligent File Operations**

- **OCR & Full-Text Search:** Integrated Optical Character Recognition (OCR) using Tesseract. Automatically extracts text from PDFs and images (PNG, JPG), enabling content-level search across the entire library.
- **AI Document Classification:** Automatically tags documents based on content (e.g., Identifying "Invoices", "Contracts", "Resumes") immediately after OCR.
- **Version Control:** Automatic tracking of all file changes. Every overwrite creates a new immutable version with rollback capability.
- **Preview & Watermarking:** Native in-browser preview for PDF, Text, and Images with **Dynamic Watermarking** (Viewer Email, IP, and Timestamp) to prevent unauthorized distribution.
- **Comments & Annotations:** Collaborative notes on any file. Supports page-specific (X/Y) annotations for PDF documents.

### **2.2 Organization & Lifecycle**

- **Secure External Sharing:** Generate time-limited, password-protected sharing links for external parties. Supports view limits and automatic expiration.
- **Retention Policies:** Automated lifecycle management. Define rules to archive or purge documents after a set duration (e.g., "Delete after 7 years").
- **Legal Hold:** Prevents the deletion of documents involved in litigation, overriding retention and manual delete actions.
- **Trash / Recycle Bin:** Soft-delete workflow allowing file recovery within a 30-day window.
- **Duplicate Detection:** Intelligent identification of identical content hashes across the tenant to optimize storage.

### **2.3 Security & Compliance**

- **Encryption:** Files are stored using Content-Addressable Storage (CAS) and encrypted at rest.
- **Activity Feed:** Unified audit trail of all actions (Uploads, Deletions, Views, Restores) for compliance and forensic auditing.
- **Tenancy Isolation:** Strict database and filesystem-level partitioning between organizations.

## **3. Integration with SENT Ecosystem**

- **SENTpeople:** Stores signed Employment Contracts; uses AI classification to verify document types.
- **SENTtax:** Stores filed VAT-100 returns; applies 7-year retention policies automatically.
- **SENTpilot:** Handles ticket attachments with secure external sharing for client communication.
- **SENTpulse:** Stores forensic logs and remote terminal session recordings.

## **4. Technical Details**

- **Storage Engine:** Content-Addressable Storage (CAS) using SHA-256 hashing. Identical files across different paths or users occupy only one physical block of storage.
- **Processing:** Asynchronous job queuing via the **River** worker system for heavy tasks like OCR and watermarking.
- **Safety:** Streaming-based file handling to support large-scale storage without memory exhaustion.
