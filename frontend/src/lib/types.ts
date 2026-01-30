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
