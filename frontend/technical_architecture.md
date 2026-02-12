# **SENT LLC - Master Technical Architecture**

**Version:** 5.0 (Fullstack Web Specification)

**Architecture Style:** Decoupled Fullstack Web Application

**Repository Strategy:** Monorepo (Next.js + Go API)

**Target Launch:** Q3 2026

## **1. Architectural Vision: "The Cloud Singularity"**

The SENT ecosystem is a **Web-First Enterprise Platform**. It leverages a high-performance Go backend and a modern Next.js 16 frontend to deliver a scalable, responsive experience across all devices.

### **1.1 The API Protocol**

SENT utilizes **ConnectRPC** for frontend-to-backend communication.

#### **Why "ConnectRPC" is better than "Vanilla gRPC"**

Vanilla gRPC breaks in the browser. Browsers do not support the specific HTTP/2 framing gRPC needs. To make it work, you usually have to run a complex proxy (Envoy) to translate gRPC-Web.

**ConnectRPC** is a Go library that supports three protocols simultaneously on the same port:

1.  **gRPC:** For your high-performance Go Agents.
2.  **gRPC-Web:** For legacy browser clients.
3.  **Connect (HTTP/JSON):** For your Next.js Frontend.

This means your Go Agent speaks binary (Protobuf) for speed, but your Next.js Frontend can debug requests in the Network tab as standard JSON. It is the best of both worlds.

#### **Architecture Diagram: The Unified Protocol**

Here is how data flows in your SENT ecosystem using this model:

1.  **The Agent (Go):** Generates a `HeartbeatRequest` struct (from Protobuf). Sends it via gRPC (HTTP/2) to `api.sent.com`.
2.  **The Server (Go):** Receives the binary data, saves to TimescaleDB.
3.  **The Frontend (Next.js):**
    *   **Server Components (RSC):** Import the exact same generated Go client code (via FFI or internal HTTP) to fetch data.
    *   **Client Components:** Use `connect-web` (TypeScript) to call the API. It looks like a normal `fetch`, but it's type-safe.

#### **Where REST is still needed (The "External" Exception)**

You cannot force third-party integrators (e.g., a client wanting to pull their own reports) to use RPC.

**Solution: Use Vanguard (or grpc-gateway).**

You write your API once in RPC.

**Vanguard** is a Go middleware that automatically "transcodes" your RPC definitions into a REST API.

Example: A call to `POST /rpc/GetDevice` automatically becomes available as `GET /api/v1/device/:id` for external users.

### **1.2 Implementation Strategy**

Define Protocol (`/proto`): Create a file `sent/v1/agent.proto`.

**Protocol Buffers**
```protobuf
service AgentService {
  // The heartbeat logic
  rpc CheckIn(CheckInRequest) returns (CheckInResponse);

  // The live terminal logic (Streaming)
  rpc StreamTerminal(stream TerminalInput) returns (stream TerminalOutput);
}
```

Generate Code: Use `buf generate`. It will create:

*   `pkg/proto/agent_grpc.pb.go` (For the Backend & Agent)
*   `frontend/src/gen/agent_connect.ts` (For Next.js)

Develop: You never write manual JSON parsers again.

## **2. Core Technology Stack**

| Layer            | Technology                  | Implementation Detail                                                               |
| :--------------- | :-------------------------- | :---------------------------------------------------------------------------------- |
| **Frontend UI**  | **Next.js 15 (App Router)** | React Server Components (RSC) for performance, Client Components for interactivity. |
| **Core Backend** | **Go (Golang) 1.24+**       | High-concurrency API server using **Echo**.                                         |
| **Components**   | **ShadCN/UI**               | Based on Radix UI and Tailwind.                                                     |
| **Styling**      | **TailwindCSS**             | Utility-first styling.                                                              |
| **Database**     | **PostgreSQL 16**           | Primary relational store.                                                           |
| **Time-Series**  | **TimescaleDB**             | Extension enabled for telemetry (logs, metrics).                                    |
| **Data Access**  | **PGX & SQLc**              | Fast, type-safe SQL code generation.                                                |
| **Auth**         | **Zitadel**                 | OIDC Provider. Handles SSO, MFA, and Audit Trails.                                  |

## **3. Data Architecture**

### **3.1 The Unified Schema**

All modules share a single database schema managed by SQLc.

* **Tenancy:** Strict organization_id isolation at the query level.
* **Audit Logs:** Global interceptors in the Go layer ensure every mutation is recorded in a TimescaleDB hypertable.

## **4. Deployment Pipeline**

1.  **Frontend:** Deployed to Vercel or as a Dockerized Node.js app.
2.  **Backend:** Compiled into a single static Go binary.
3.  **Containerization:** Full `docker-compose` support for local development and cloud production.