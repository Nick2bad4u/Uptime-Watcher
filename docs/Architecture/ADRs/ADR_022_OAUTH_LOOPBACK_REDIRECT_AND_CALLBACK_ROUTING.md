---
schema: "../../../config/schemas/doc-frontmatter.schema.json"
title: "ADR-022: OAuth Loopback Redirect and Callback Routing"
summary: "Defines OAuth 2.0 + PKCE loopback redirect behavior for cloud providers, including callback validation and when provider-specific redirect URI shapes are required (Dropbox vs Google Drive)."
created: "2025-12-15"
last_reviewed: "2025-12-16"
category: "guide"
author: "Nick2bad4u"
tags:
  - "uptime-watcher"
  - "architecture"
  - "adr"
  - "oauth"
  - "pkce"
  - "security"
  - "cloud"
  - "dropbox"
  - "google-drive"
---

# ADR-022: OAuth Loopback Redirect and Callback Routing

## Status

✅ Accepted (implemented for Dropbox + Google Drive)

## Context

Uptime Watcher uses first-class cloud providers (Dropbox and Google Drive). Provider authentication is performed via OAuth 2.0 Authorization Code + PKCE.

For desktop apps, a robust approach is:

- open the provider authorization URL in the **system browser**
- receive the authorization code via a **loopback redirect** to a localhost HTTP server

We must standardize loopback redirect behavior across providers to avoid:

- inconsistent redirect URI registrations
- callback routing drift between providers
- security regressions (accepting callbacks from non-local sources, missing state validation, etc.)

## Decision drivers

1. **Security**: strict state validation, strict localhost binding, strict timeouts.
2. **Provider parity**: Dropbox/Google should behave the same at the “OAuth transport” layer.
3. **Operational simplicity**: avoid per-provider ports/paths unless required.
4. **Low churn**: do not break existing Dropbox setup unless necessary.

## Decision

### 1) Prefer a shared port; allow provider-specific redirect URIs

We keep a consistent _port_ for simplicity, but we do **not** force a single redirect URI shape across providers.

Provider requirements differ:

- **Dropbox**: uses a loopback HTTP server with a stable path (`/oauth2/callback`) because the Dropbox app registration expects an exact redirect URI string.
- **Google Drive**: follows Google’s native/desktop guidance for loopback redirects:
  - `http://127.0.0.1:port` (no explicit path)
  - callbacks arrive at `/`

This avoids `redirect_uri_mismatch` errors and aligns with Google’s documented best practices.

### 2) Loopback server binding + callback validation

Loopback redirect servers must:

- bind only to loopback interfaces:
  - `127.0.0.1` (IPv4)
  - `::1` (IPv6)
- reject callbacks from non-loopback origins
- require `code` and `state`
- validate `state` exactly
- enforce a short timeout (e.g. 2 minutes)

### 3) Concurrency model

At most one provider connect flow is active at a time.

This aligns with ADR-021 (“one provider at a time”) and avoids port-binding conflicts.

## Implementation notes

- Dropbox reference implementation:
  - `electron/services/cloud/providers/dropbox/DropboxAuthFlow.ts`
- Google Drive reference implementation:
  - `electron/services/cloud/providers/googleDrive/GoogleDriveAuthFlow.ts`
  - `electron/services/cloud/oauth/LoopbackOAuthServer.ts`

## Alternatives considered

### A) Provider-specific callback paths

Example: `/oauth2/dropbox/callback`, `/oauth2/google/callback`.

Pros:

- clearer logs

Cons:

- more redirect URIs to register per provider
- more moving parts without functional benefit under the “single flow at a time” model

### B) Dynamic ephemeral ports

Pros:

- avoids local port conflicts

Cons:

- most providers require explicit redirect registration (a dynamic port complicates setup)
- harder for end-users and maintainers

## References

- Google: [OAuth 2.0 for iOS & Desktop Apps (loopback IP redirect)](https://developers.google.com/identity/protocols/oauth2/native-app#redirect-uri_loopback)

## Consequences

- **Pro**: consistent provider onboarding and fewer setup instructions.
- **Pro**: easier to add additional providers without inventing new callback transport.
- **Con**: if another local process already binds the fixed port, OAuth connect fails (this must surface as a clear user error).

## Related ADRs

- ADR-005: IPC Communication Protocol
- ADR-009: Validation Strategy
- ADR-015: Cloud Sync and Remote Backup Providers
- ADR-021: Cloud Provider Selection and Settings UI
- ADR-023: Secret Storage and Encryption Policy
