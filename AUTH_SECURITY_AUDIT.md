# SENT Auth System Security Audit & Hardening Report

## 1. Vulnerability Audit Summary

| ID          | Vulnerability                        | Risk     | Status | Remediation                                                                                    |
| :---------- | :----------------------------------- | :------- | :----- | :--------------------------------------------------------------------------------------------- |
| **SNT-001** | **Weak OIDC State Entropy**          | High     | Fixed  | Replaced predictable timestamps with 32-byte cryptographically secure random states.           |
| **SNT-002** | **Horizontal Tenant Escalation**     | Critical | Fixed  | Removed `tenantID` arguments from Bridge APIs; enforced backend-resolved session scoping.      |
| **SNT-003** | **Unauthenticated Admin Escalation** | High     | Fixed  | Revoked "First-User-is-Admin" logic; implemented domain-based mandatory tenant anchoring.      |
| **SNT-004** | **CSRF via OIDC Callback**           | High     | Fixed  | Implemented mandatory state validation in `startCallbackServer` with one-time use token logic. |
| **SNT-005** | **Race Condition in User Sync**      | Low      | Fixed  | Implemented atomic check-and-create with database uniqueness conflict resolution.              |

---

## 2. Hardening Suite Implementation

### OIDC Path Security (`pkg/auth/authenticator.go`)

- **State Store**: Added a thread-safe `map[string]time.Time` to track pending states and their expirations.
- **Callback Integrity**: The local callback server now validates that the returned `state` exactly matches the expected high-entropy state generated at the start of the flow.
- **Identity Anchoring**: `syncUserToDB` now extracts the email domain from the OIDC claims and verifies it against the `Tenant.Domain` field, preventing unauthorized users from joining different organizations.

### RBAC Precision (`pkg/auth/middleware.go`)

- **Role Constants**: Replaced hardcoded string literals with `RoleAdmin` constants.
- **Fail-Closed Logic**: Enhanced `Guard` to explicitly fail if the identity subject is missing or the user profile cannot be resolved.

### Bridge Isolation Protocol (`pkg/vault`, `pkg/capital`, `pkg/stock`)

- **Session Scoping**: All bridge methods now call `auth.GetUserProfile()` to retrieve the `TenantID`.
- **Parameter Removal**: Cleaned up the Bridge surface area by removing the `tenantID` parameter from frontend-exposed signatures, eliminating the primary vector for parametric data leakage.

---

## 3. SENT Tenant Isolation Protocol (STIP-01)

This protocol is mandatory for all future bridge implementations.

### 3.1 Principle of Backend Sovereignty

The frontend is inherently untrusted. The backend must never rely on the frontend to identify the current tenant or user context.

### 3.2 Backend Implementation Requirements

1. **Context Resolution**: Every sensitive method MUST fetch the `UserProfile` from the `AuthBridge`.
2. **Mandatory Filtering**: Every database query MUST include a tenant filter:
   ```go
   Where(entity.HasTenantWith(tenant.ID(profile.TenantID)))
   ```
3. **Storage Anchoring**: File operations MUST be anchored to `storage/tenant_{ID}` using `afero.BasePathFs`.
4. **Admin Verification**: Role-based bypasses must use the `HasRole(auth.RoleAdmin)` check rather than local string comparisons.

---

**Auditor Signature**: Principal Identity Architect & Lead Security Engineer
**Timestamp**: 2026-01-29
**Status**: Industrial-Grade Resilience Verified.
