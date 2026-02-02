// src/lib/api/rpc-client.ts

/**
 * SENT UNIFIED BRIDGE - MAGIC PROXY
 * 
 * Automatically routes calls to Wails (IPC) or Web (HTTP).
 */

const IS_DESKTOP = typeof window !== 'undefined' && (window as any).runtime !== undefined;

export interface RpcRequest {
    module: string;
    bridge: string;
    method: string;
    args: any[];
}

/**
 * Creates a type-safe proxy for a backend bridge.
 * @param pkg - The Go package name (e.g., 'capital', 'wails_bridge')
 * @param bridge - The Bridge struct name (e.g., 'CapitalBridge')
 */
export function createRpcProxy<T extends object>(pkg: string, bridge: string): T {
    return new Proxy({} as T, {
        get(_, method: string) {
            return async (...args: any[]) => {
                if (IS_DESKTOP) {
                    // --- Wails Desktop Path ---
                    const go = (window as any).go;
                    if (!go || !go[pkg] || !go[pkg][bridge] || !go[pkg][bridge][method]) {
                        throw new Error(`Wails bridge method not found: go.${pkg}.${bridge}.${method}`);
                    }
                    return go[pkg][bridge][method](...args);
                } else {
                    // --- standard HTTP Web Path ---
                    console.debug(`[RPC] Web Call: ${pkg}.${bridge}.${method}`, args);
                    
                    const response = await fetch('/api/rpc', {
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
                }
            };
        },
    });
}
