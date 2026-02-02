# 🌉 Technical Guide: Unified RPC Bridge (Magic Proxy)

This document explains the implementation of the **SENT Unified Bridge**, which allows the same frontend code to communicate with the Go backend via **Wails IPC** (Desktop) or **JSON-RPC over HTTP** (Web).

## 1. The Frontend "Magic Proxy"
The core of the frontend abstraction is the `createRpcProxy` function located in `src/lib/api/rpc-client.ts`.

### How it works:
It uses the native JavaScript `Proxy` object to intercept every method call on a service.

```typescript
export function createRpcProxy<T extends object>(pkg: string, bridge: string): T {
    return new Proxy({} as T, {
        get(_, method: string) {
            return async (...args: any[]) => {
                if (IS_DESKTOP) {
                    // Routes to window.go[pkg][bridge][method]
                } else {
                    // Routes to POST /api/rpc payload { module, bridge, method, args }
                }
            };
        },
    });
}
```

### Benefits:
- **Zero Boilerplate:** No need to write manual `fetch` calls or `Wails` wrappers for every new function.
- **Type Safety:** We use TypeScript interfaces (e.g., `ICapitalService`) to ensure compile-time safety.

---

## 2. The Backend Dispatcher
The backend logic is handled by the `RpcHandler` in `backend/internal/app/rpc/handler.go`.

### How it works:
It uses Go **Reflection** to dynamically find and call methods on the registered bridge structs.

1.  **Lookup:** It finds the registered bridge by module and name.
2.  **Reflect:** It retrieves the method by string name using `reflect.ValueOf(bridge).MethodByName(methodName)`.
3.  **Argument Conversion:** It automatically converts incoming JSON arguments to the specific Go types expected by the method signature.
4.  **Execution:** It calls the method and handles the return values (converting Go errors to HTTP 500s).

---

## 3. How to Add a New Module

To expose a new Go module to the frontend in both Web and Desktop modes:

### Step 1: Define the Go Bridge
Create your bridge in `backend/internal/divisions/...`.
```go
type MyNewBridge struct { db *pgxpool.Pool }
func (b *MyNewBridge) DoSomething(ctx context.Context, input string) (string, error) { ... }
```

### Step 2: Register in `main.go`
Register the bridge with the RPC handler in the `runServer` function:
```go
rpcHandler.Register("my_module", "MyNewBridge", myBridgeInstance)
```

### Step 3: Define Frontend Interface
Add the interface and instantiate the proxy in `frontend/src/lib/api/services.ts`:
```typescript
export interface IMyService {
    DoSomething(input: string): Promise<string>;
}
export const MyService = createRpcProxy<IMyService>('my_module', 'MyNewBridge');
```

### Step 4: Use it!
```tsx
const result = await MyService.DoSomething("Hello");
```

---

## 4. Payloads & Protocol
**Endpoint:** `POST /api/rpc`
**Request Body:**
```json
{
  "module": "capital",
  "bridge": "CapitalBridge",
  "method": "GetTransactions",
  "args": []
}
```
**Response:** JSON representation of the first return value of the Go method.
