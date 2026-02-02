// src/lib/api/services.ts
import { createRpcProxy } from './rpc-client';

// --- ERP Division ---

export interface ICapitalService {
    GetTransactions(): Promise<any[]>;
    CreateTransaction(tx: any): Promise<string>;
    GetAccounts(): Promise<any[]>;
    ApproveTransaction(id: number): Promise<string>;
}

export interface IStockService {
    GetInventory(): Promise<any[]>;
    CreateStockItem(item: any): Promise<string>;
}

export interface IPeopleService {
    GetEmployees(): Promise<any[]>;
    CalculatePayroll(empId: number, currency: string): Promise<any>;
}

// --- MSP Division ---

export interface IPulseService {
    GetDevices(): Promise<any[]>;
    RunScript(deviceId: string, scriptId: string): Promise<string>;
}

export interface IPilotService {
    GetTickets(): Promise<any[]>;
    CreateTicket(ticket: any): Promise<string>;
}

// --- Instantiate Services ---

export const CapitalService = createRpcProxy<ICapitalService>('capital', 'CapitalBridge');
export const StockService = createRpcProxy<IStockService>('stock', 'StockBridge');
export const PeopleService = createRpcProxy<IPeopleService>('wails_bridge', 'PeopleBridge');
export const PulseService = createRpcProxy<IPulseService>('wails_bridge', 'PulseBridge');
export const PilotService = createRpcProxy<IPilotService>('pilot', 'PilotBridge');
