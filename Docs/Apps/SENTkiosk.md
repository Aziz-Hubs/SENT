# **SENTkiosk – Point of Sale (POS)**

**Division:** SENTerp (Business)  
**Architecture:** Retail & Checkout Engine  
**Status:** [GOLD_MASTER_READY]

## **1. Executive Summary**

SENTkiosk is the Point of Sale (POS) interface for the SENT ecosystem. It is designed for "Over the Counter" sales, enabling rapid checkout, hardware sales, or service payments. It shares the same product database as SENTstock but is optimized for cashier speed.

## **2. Core Features**

### **2.1 Sales Interface**

- **Visual Cart:** Touch-friendly product grid and cart management. Use "+" and "-" for quick quantity adjustments.
- **Checkouts:** Supports multiple payment methods:
  - **Cash:** Built-in change calculator and cash drawer trigger.
  - **Card:** Integrated payment terminal hook.
- **Cart Actions:**
  - **Hold:** Suspend a transaction (save to local storage) to serve another customer, then restore it later.
  - **Discount:** Apply percentage `%` or fixed amount `$` discounts to the total.
  - **Void:** Clear cart instantly.

### **2.2 Hardware Integration**

- **Receipt Printing:** Generates slip-style receipts for thermal printers.
- **Cash Drawer:** API signal to pop the cash drawer open upon cash sale completion.

## **3. Integration with SENT Ecosystem**

- **SENTstock:** Real-time inventory deduction. If Kiosk sells 1 unit, Stock decreases by 1 immediately.
- **SENTcapital:** "End of Day" closings post a "Sales Revenue" journal entry to the ledger.

## **4. Future Roadmap**

- **Customer Loyalty:** Attach a customer profile to the sale to earn points.
- **Returns/Refunds:** Workflow for processing returns back into inventory.
