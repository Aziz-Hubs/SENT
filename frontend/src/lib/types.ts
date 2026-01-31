export interface SystemStatus {
    hostname: string;
    uptime: string;
    time: string;
    startTime: number;
    recentEvents?: string[]; // Optional as Wails might miss it
}

export interface UserProfile {
    sub: string;
    name: string;
    email: string;
    picture: string;
    given_name: string;
    family_name: string;
    firstName?: string; // Fallback for non-standard OIDC claims
    lastName?: string;  // Fallback for non-standard OIDC claims
    tenantId: number;
    role: string;
    seniority: string;
}

export interface Account {
    id: number;
    name: string;
    number: string;
    type: string; // Changed from union to string to match bridge DTO
    balance: number;
}

export interface Product {
    id: number;
    sku: string;
    name: string;
    description: string;
    unitCost: number;
    quantity: number;
    reserved: number;
    incoming: number;
    hasVariants?: boolean;
    variants?: ProductVariant[];
    barcode?: string;
    supplierName?: string;
    categoryName?: string;
    minStock?: number;
    serialNumber?: string;
    purchaseDate?: string;
    purchasePrice?: number;
    usefulLifeMonths?: number;
    warrantyExpiresAt?: string;
    isDisposed?: boolean;
    currentValue?: number;
    location?: string;
}

export interface ProductVariant {
    id: number;
    name: string;
    sku: string;
    priceAdjustment: number;
    stock: number;
}

export interface Contact {
    id: number;
    name: string;
    email: string;
    phone: string;
    type: string;
    loyaltyPoints: number;
    lifetimeValue: number;
}

export interface Payment {
    method: "cash" | "card" | "other";
    amount: number;
}

export interface StockMovement {
    id: number;
    type: string; // Changed from union to string to match bridge DTO
    quantity: number;
    reason: string;
    date: any; 
    productName: string;
}

export interface TransactionRequest {
    description: string;
    date: any;
    entries: LedgerEntryRequest[];
}

export interface LedgerEntryRequest {
    account_id: number;
    amount: number;
    direction: string;
}

export interface TransactionDTO {
    id: number;
    description: string;
    date: string;
    total_amount: number;
    approval_status: string;
    reference: string;
}

export interface AuditLog {
    id: number;
    action: string;
    entityType: string;
    entityId: number;
    userName: string;
    details: string;
    createdAt: string;
}

export interface MaintenanceSchedule {
    id: number;
    productId: number;
    productName: string;
    scheduledAt: string;
    completedAt?: string;
    status: "pending" | "completed" | "overdue";
    notes: string;
}

export interface StockAlert {
    id: number;
    type: string;
    message: string;
    isRead: boolean;
    createdAt: string;
    productId?: number;
}

export interface PurchaseOrder {
    id: number;
    poNumber: string;
    supplierId: number;
    supplierName: string;
    status: string;
    orderDate: string;
    expectedDate?: string;
    totalAmount: number;
    lines: PurchaseOrderLine[];
}

export interface PurchaseOrderLine {
    id: number;
    productId: number;
    productName: string;
    quantity: number;
    unitCost: number;
    receivedQty: number;
}

export interface InventoryCount {
    id: number;
    productId: number;
    productName: string;
    countedQty: number;
    systemQty: number;
    variance: number;
    countedAt: string;
    countedBy: string;
}
