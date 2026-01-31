# **SENTcapital – Financial ERP**

**Division:** SENTerp (Business)  
**Architecture:** Financial Engine (CapitalBridge)  
**Status:** [GOLD_MASTER_READY]

## **1. Executive Summary**

SENTcapital is the financial nerve center of the SENT ecosystem. It unifies Double-Entry Ledger accounting with Commercial Operations (Invoicing & AR), providing a single source of truth for all financial data. It eliminates the gap between "Operations" and "Finance" by integrating directly with SENTpilot (PSA) and SENTpeople (Payroll).

## **2. Technical Architecture**

### **2.1 Double-Entry Ledger**

- **Core Principle:** Every transaction must balance (Debits = Credits).
- **Storage:** PostgreSQL with strict check constraints ensures data integrity.
- **Audit Trail:** Immutable transaction logs with "Staged" -> "Approved" workflows.

### **2.2 Features**

#### **2.2.1 General Ledger**

- **Chart of Accounts:** Hierarchical account structure (Assets, Liabilities, Equity, Revenue, Expenses).
- **Journal Entries:** Manual and automated journal entry posting.
- **Reporting:** Real-time generation of P&L (Profit & Loss) and Trial Balance reports (PDF export).

#### **2.2.2 Commercial Operations (New)**

- **Invoicing:** Create and send professional invoices directly from the ERP.
- **Accounts Receivable:** Track unpaid invoices, aging reports, and customer balances.
- **Revenue Recognition:** Automatically posts revenue to the General Ledger upon invoice approval.

## **3. Integration with SENT Ecosystem**

- **SENTpeople:** Payroll runs automatically create Expense (Debit) and Cash (Credit) entries in the ledger.
- **SENTpilot:** Billable hours from PSA tickets are converted into Invoices in SENTcapital.
- **SENTstock:** Real-time inventory asset valuation and automated straight-line depreciation postings.
- **SENTgov:** All transactions are tagged with tax codes for automated compliance reporting.

## **4. Workflow**

1.  **Operation:** A technician closes a ticket in SENTpilot.
2.  **Billing:** A draft invoice is generated in SENTcapital.
3.  **Approval:** Finance manager approves the invoice -> Sent to Customer.
4.  **Accounting:** Revenue is recognized in the General Ledger.
5.  **Payment:** Customer pays -> Cash account credited, AR debited.
