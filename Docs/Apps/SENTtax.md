# **SENTtax – Compliance & Regulatory Engine**

**Division:** SENTerp (Business)  
**Architecture:** Tax Compliance & Filing Engine  
**Status:** [GOLD_MASTER_READY]

## **1. Executive Summary**

SENTtax is the automated compliance center for the SENT ecosystem. It serves as the bridge between SENTcapital (Financials) and government tax authorities (e.g., ZATCA, IRS, HMRC). It automates the preparation, validation, and digital submission of tax returns (VAT-100).

## **2. Core Features**

### **2.1 Digital Tax Return (VAT-100)**

- **Automated Box Calculation:** Automatically aggregates "Output Tax" (Sales) and "Input Tax" (Purchases) from the General Ledger.
- **Drill-Down Audit:** Click on any tax box (e.g., Box 1) to see the exact constituent transactions, including Invoice ID, Date, and Tax Code.
- **Period locking:** Allows Finance Managers to "Lock" a tax period, making all underlying transactions immutable to prevent fraud or accidental edits.
- **Digital Filing:** One-click submission of the return to the tax authority via API.

### **2.2 Configuration & Jurisdictions**

- **Multi-Jurisdiction:** Supports configuring rules for multiple countries (e.g., `JO-16%`, `SA-15%`).
- **Fiscal Devices:** Integration flags for hardware that requires physical fiscalization (e.g., ZATCA Phase 2).

## **3. Integration with SENT Ecosystem**

- **SENTcapital:** Sources all transaction data directly from the Double-Entry Ledger.
- **SENTvault:** Stores the immutable "Filed Return" artifacts and transmission receipts; automatically applies **7-year mandatory retention policies** for tax compliance.
- **SENTadmin:** Enforces RBAC so only the CFO/Finance Admin can "File" a return.

## **4. Workflow**

1.  **Accumulate:** Transactions in SENTcapital are tagged with Tax Codes (e.g., `OUTPUT_VAT_STD`).
2.  **Review:** Finance team reviews the **SENTtax** dashboard to see real-time liability accumulation.
3.  **Lock:** At quarter-end, the period is Locked.
4.  **File:** The VAT-100 form is generated, signed, and transmitted.
5.  **Archive:** The return is stored in **SENTvault** for future audits.
