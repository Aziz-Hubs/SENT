// src/lib/api/services.ts
import { createRpcProxy } from './rpc-client';

export interface ICapitalService {
    GetTransactions(): Promise<any[]>;
    CreateTransaction(tx: any): Promise<string>;
    GetAccounts(): Promise<any[]>;
}

export interface IStockService {
    GetInventory(): Promise<any[]>;
}

export interface IPeopleService {
    GetEmployees(): Promise<any[]>;
}

export const CapitalService = createRpcProxy<ICapitalService>('capital', 'CapitalBridge');
export const StockService = createRpcProxy<IStockService>('stock', 'StockBridge');
export const PeopleService = createRpcProxy<IPeopleService>('people', 'PeopleBridge');
