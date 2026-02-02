// src/lib/api/capital.ts
import { getService, isDesktop } from './bridge';

// --- Types (mirroring Go structs) ---
export interface Transaction {
    id: number;
    description: string;
    amount: number;
    date: string;
}

// --- Interface ---
export interface ICapitalService {
    getTransactions(): Promise<Transaction[]>;
    createTransaction(tx: Omit<Transaction, 'id'>): Promise<Transaction>;
}

// --- Desktop Implementation (Wails) ---
const desktopService: ICapitalService = {
    getTransactions: async () => {
        // Direct IPC call
        return await window.go?.capital?.CapitalBridge?.GetTransactions() || [];
    },
    createTransaction: async (tx) => {
        return await window.go?.capital?.CapitalBridge?.CreateTransaction(tx);
    }
};

// --- Web Implementation (HTTP) ---
const webService: ICapitalService = {
    getTransactions: async () => {
        const res = await fetch('/api/v1/capital/transactions');
        if (!res.ok) throw new Error('Failed to fetch transactions');
        return res.json();
    },
    createTransaction: async (tx) => {
        const res = await fetch('/api/v1/capital/transactions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tx)
        });
        if (!res.ok) throw new Error('Failed to create transaction');
        return res.json();
    }
};

// --- Export Unified Service ---
export const capitalService = getService<ICapitalService>({
    desktop: desktopService,
    web: webService
});
