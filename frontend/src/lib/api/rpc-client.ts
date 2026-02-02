// src/lib/api/rpc-client.ts

export interface RpcRequest {
    module: string;
    bridge: string;
    method: string;
    args: any[];
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export function createRpcProxy<T extends object>(pkg: string, bridge: string): T {
    return new Proxy({} as T, {
        get(_, method: string) {
            return async (...args: any[]) => {
                const response = await fetch(`${API_BASE}/api/rpc`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        module: pkg,
                        bridge: bridge,
                        method: method,
                        args: args
                    } as RpcRequest),
                });

                if (!response.ok) {
                    const error = await response.json().catch(() => ({ error: 'Internal Server Error' }));
                    throw new Error(error.message || `HTTP ${response.status}: ${pkg}.${method} failed`);
                }

                return response.json();
            };
        },
    });
}
