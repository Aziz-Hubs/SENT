# Zitadel Configuration & Setup Guide

## 1. Environment Status
**Status:** Running (Docker)
**URL:** [http://localhost:8080/ui/console](http://localhost:8080/ui/console)

## 2. Administrative Access
If the automated setup falls back to defaults (common in Docker volume persistence scenarios), use these credentials:

*   **Username:** `zitadel-admin@zitadel.localhost`
*   **Password:** `Password1!`

*Note: The `zitadel-setup.yaml` configuration for `aziz-admin` may not apply if the database volume was already initialized or if the setup command priority favored defaults.*

## 3. Application Integration (`sent-core-app`)
The SENT desktop application (`pkg/auth/authenticator.go`) is configured to use the following production-ready settings. 

### Implementation Markers:
*   **Application Type:** **Native** (Public Client).
*   **Auth Method:** **PKCE** (None - Secret not required for Native).
*   **Client ID:** `357700606812553219` (Current Active ID).
*   **Issuer:** `http://localhost:8080` (Default; can be overridden via `ZITADEL_ISSUER`).

### Step-by-Step Configuration:

1.  **Login** to the Console using the credentials above.
2.  **Create Project:**
    *   Go to **Projects** -> **Create New Project**.
    *   Name: `SENT`.
3.  **Create Application:**
    *   Inside the SENT project, click **New**.
    *   Name: `sent-core-app`.
    *   Type: **Native**.
4.  **Configure Auth:**
    *   **Redirect URIs:** `http://localhost:4242/auth/callback`
    *   **Post Logout URIs:** `http://localhost:4242/auth/logout`
5.  **Review & Create:**
    *   Click **Create**.
    *   **IMPORTANT:** Ensure the generated Client ID matches `357700606812553219`. If Zitadel generates a different ID, you MUST export it as an environment variable:

```bash
export ZITADEL_CLIENT_ID="357700606812553219"
```

## 4. Keyring Integration
The application uses the system keyring (via `github.com/zalando/go-keyring`) to persist tokens securely. 
*   **Service:** `sent-core-app`
*   **Key:** `auth-token`
*   **Security:** Tokens are encrypted by the OS-native credential store (Windows Credential Manager, macOS Keychain, or Secret Service/libsecret on Linux).

