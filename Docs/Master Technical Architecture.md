# **SENT LLC - Master Technical Architecture**

**Version:** 5.0 (Fullstack Web Specification)

**Architecture Style:** Decoupled Fullstack Web Application

**Repository Strategy:** Monorepo (Next.js + Go API)

**Target Launch:** Q3 2026

## **1. Architectural Vision: "The Cloud Singularity"**

The SENT ecosystem is a **Web-First Enterprise Platform**. It leverages a high-performance Go backend and a modern Next.js 15 frontend to deliver a scalable, responsive experience across all devices.

### **1.1 The API Protocol**

SENT utilizes a **Unified RPC Pattern** for frontend-to-backend communication.

1.  **The Transport Layer:** Standard HTTP/REST (`POST /api/rpc`).
2.  **The Frontend Client:** Next.js uses a **Server-Side and Client-Side Proxy** system to communicate with the Go API.
3.  **The Backend logic:** The Go API acts as a "Headless Engine," exposing modules (ERP, MSP, SEC) via a centralized RPC dispatcher.

## **2. Core Technology Stack**

| Layer               | Technology            | Implementation Detail                                                                              |
| :------------------ | :-------------------- | :------------------------------------------------------------------------------------------------- |
| **Frontend UI**     | **Next.js 15 (App Router)** | React Server Components (RSC) for performance, Client Components for interactivity.                |
| **Core Backend**    | **Go (Golang) 1.24+** | High-concurrency API server using **Echo**.                                                       |
| **Components**      | **ShadCN/UI**         | Based on Radix UI and Tailwind.                                                                    |
| **Styling**         | **TailwindCSS**       | Utility-first styling.                                                                             |
| **Database**        | **PostgreSQL 16**     | Primary relational store.                                                                          |
| **Time-Series**     | **TimescaleDB**       | Extension enabled for telemetry (logs, metrics).                                                   |
| **Data Access**     | **PGX & SQLc**        | Fast, type-safe SQL code generation.                                                               |
| **Auth**            | **Zitadel**           | OIDC Provider. Handles SSO, MFA, and Audit Trails.                                                 |

## **3. Data Architecture**

### **3.1 The Unified Schema**

All modules share a single database schema managed by SQLc.

* **Tenancy:** Strict organization_id isolation at the query level.
* **Audit Logs:** Global interceptors in the Go layer ensure every mutation is recorded in a TimescaleDB hypertable.

## **4. Deployment Pipeline**

1.  **Frontend:** Deployed to Vercel or as a Dockerized Node.js app.
2.  **Backend:** Compiled into a single static Go binary.
3.  **Containerization:** Full `docker-compose` support for local development and cloud production.
