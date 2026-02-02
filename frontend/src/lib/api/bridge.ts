// src/lib/api/bridge.ts

/**
 * BRIDGE PROTOCOL - HYBRID CLIENT ARCHITECTURE
 * 
 * This module abstracts the communication layer between Frontend and Backend.
 * 
 * MODES:
 * 1. Desktop Mode (Wails): Uses `window.go` IPC bridge. Zero latency.
 * 2. Web Mode (HTTP): Uses `fetch` to call REST endpoints.
 * 
 * DETECTION:
 * Checks for existence of `window.runtime` (injected by Wails).
 */

// Define the global window type for Wails
declare global {
    interface Window {
        runtime?: any; // Wails runtime presence check
        go?: {
            capital?: {
                CapitalBridge: {
                    GetTransactions: () => Promise<any[]>;
                    CreateTransaction: (tx: any) => Promise<any>;
                    // Add other methods as they are discovered
                }
            }
        }
    }
}

// Environment Detection
export const isDesktop = (): boolean => {
    return typeof window !== 'undefined' && typeof window.runtime !== 'undefined';
};

// Base Interface for all Service Adapters
export interface ServiceAdapter<T> {
    desktop: T;
    web: T;
}

// Factory to get the correct implementation
export function getService<T>(adapter: ServiceAdapter<T>): T {
    if (isDesktop()) {
        console.debug("[Bridge] Mode: Desktop (Wails)");
        return adapter.desktop;
    } else {
        console.debug("[Bridge] Mode: Web (HTTP)");
        return adapter.web;
    }
}
