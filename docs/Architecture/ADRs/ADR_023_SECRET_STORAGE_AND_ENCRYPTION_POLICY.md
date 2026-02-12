---
schema: "../../../config/schemas/doc-frontmatter.schema.json"
doc_title: "ADR-023: Secret Storage and Encryption Policy"
summary: "Defines how the app stores OAuth tokens and other secrets for cloud providers, including encryption-at-rest expectations, safe fallbacks, and logging redaction rules."
created: "2025-12-15"
last_reviewed: "2026-02-11"
doc_category: "guide"
author: "Nick2bad4u"
tags:
 - "uptime-watcher"
 - "architecture"
 - "adr"
 - "security"
 - "cloud"
 - "secrets"
 - "encryption"
 - "safeStorage"
 - "dropbox"
 - "google-drive"
---

# ADR-023: Secret Storage and Encryption Policy

## Status

✅ Accepted (implemented; UX messaging may evolve)

## Context

Cloud providers (Dropbox, Google Drive) require OAuth credentials:

- access tokens
- refresh tokens
- token expiry timestamps

These values are sensitive and must be treated as secrets.

The app runs as a desktop client and cannot rely on an OAuth client secret remaining secret.

## Decision drivers

1. **Security boundary**: secrets must never enter the renderer process.
2. **Least disclosure**: logs must not contain tokens or passphrases.
3. **Cross-platform**: a storage policy must work on Windows/macOS/Linux.
4. **Operability**: users need predictable behavior across restarts.

## Decision

### 1) Secrets are main-process only

All OAuth tokens and secrets:

- are created/handled in Electron main
- are stored in Electron main
- are never returned over IPC to the renderer

Renderer-visible types may include only _safe_ provider details:

- account labels
- selected folder identifiers (if safe)
- connection status

### 2) Secret storage abstraction

Electron main stores secrets via the `SecretStore` abstraction.

This enforces a single entry point for:

- encryption
- serialization
- namespacing keys per provider
- future migration/rotation behavior

### 3) Encryption-at-rest policy

Preferred behavior:

- use Electron `safeStorage` to encrypt secret payloads before persisting them

OS-backed secure storage:

- Windows: Data Protection API (DPAPI)
- macOS: Keychain
- Linux: Secret Service / system keyring when available

Uptime Watcher uses `safeStorage` as the platform abstraction rather than
shipping a separate keychain dependency.

Envelope encryption posture:

- Secrets are stored as encrypted blobs.
- The encryption keys are managed by the OS (via Electron/Chromium).
- The app does not embed a static “app key” for decrypting secrets.

Fallback behavior:

- if OS-backed encryption is unavailable, secrets are stored in-memory only for
  the current session

This avoids writing plaintext tokens to disk.

Corruption handling:

- If an encrypted secret cannot be decrypted (for example, user/profile change
  or corrupted storage), the secret is treated as missing and is cleared
  best-effort. The provider must be reconnected.

### 4) Logging policy (redaction)

The following must never be logged:

- access tokens
- refresh tokens
- authorization codes
- PKCE `code_verifier`
- encryption passphrases

The following must not be logged because they can embed secrets:

- OAuth redirect URIs
- OAuth authorization URLs

When retrying HTTP requests, logs may include only:

- operation name
- attempt number
- status code
- backoff timing

### 5) Export/import policy

Secret export/import is not supported.

Users can:

- disconnect a provider
- reconnect a provider

## Implementation notes

- Secret storage:
  - `electron/services/cloud/secrets/SecretStore.ts`
    - includes `SafeStorageSecretStore`, `EphemeralSecretStore`, and
      `FallbackSecretStore`
  - Construction:
    - `electron/services/cloud/CloudService.ts` (wraps `SafeStorageSecretStore`
      with an `EphemeralSecretStore` fallback)
- Dropbox tokens:
  - `electron/services/cloud/providers/dropbox/DropboxTokenManager.ts`

Secret types currently stored in `SecretStore` include:

- OAuth token JSON (Dropbox / Google Drive)
- locally cached, passphrase-derived encryption key material for cloud sync
  (`SECRET_KEY_ENCRYPTION_DERIVED_KEY`)

The passphrase itself is never stored.

## Consequences

- **Pro**: secrets remain isolated from renderer compromise.
- **Pro**: avoids plaintext tokens on disk on platforms where encryption is unavailable.
- **Con**: on platforms without `safeStorage` encryption support, providers will require re-auth on restart unless we add an explicit UX warning and/or a stronger persistence mechanism.

## Related ADRs

- ADR-009: Validation Strategy
- ADR-015: Cloud Sync and Remote Backup Providers
- ADR-021: Cloud Provider Selection and Settings UI
- ADR-022: OAuth Loopback Redirect and Callback Routing
