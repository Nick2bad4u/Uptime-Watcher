---
schema: "../../config/schemas/doc-frontmatter.schema.json"
doc_title: "Cloud Provider Implementation Guide"
summary: "Developer guide for adding new Cloud Sync / Remote Backup providers (e.g. Google Drive) safely and consistently."
created: "2025-12-15"
last_reviewed: "2025-12-31"
doc_category: "guide"
author: "Nick2bad4u"
tags:
 - "cloud"
 - "sync"
 - "backups"
 - "architecture"
 - "ipc"
 - "zod"
 - "oauth"
 - "pkce"
 - "providers"
---

# Cloud Provider Implementation Guide

This guide explains how to add a new cloud provider (e.g. Google Drive) to Uptime Watcher.

## Goals

- Maintain the **security boundary**: secrets never enter the renderer.
- Keep cross-process contracts **typed and validated**.
- Keep the Settings UI scalable: provider setup must live behind the **provider tabs**.

## Non-goals

- Multi-provider sync semantics. The current policy is **one active provider at a time**.

## Required architecture invariants

1. **OAuth flows in Electron main**
   - System browser (`shell.openExternal`)
   - Loopback redirect server (localhost)
   - PKCE

2. **Secrets are main-only**
   - Tokens stored via `electron/services/cloud/secrets/SecretStore.ts`
   - Shared types must never include tokens.

3. **IPC is request/response, typed, validated**
   - Channels live in `shared/types/preload.ts` and `shared/types/ipc.ts`
   - Payload validation lives in `shared/validation/*`
   - Handlers registered via the standardized IPC handler utilities

4. **UI must scale**
   - Provider setup belongs in the Provider tab panel
   - The rest of Cloud actions (sync, backups, advanced) should not multiply per provider

5. **Provider boundary must be strict**
   - Parse/validate all third-party API responses at the boundary (Zod schemas in the provider folder)
   - Normalize and validate provider keys consistently (POSIX keys, no traversal)
   - Emit consistent, typed operation errors (see below)

## Provider boundary responsibilities (must-haves)

### Runtime validation

- Use **Zod** at the provider boundary to validate:
  - third-party SDK payloads (Dropbox SDK)
  - raw REST responses (Google Drive)
  - error envelopes (best-effort extractors)

This prevents “ad-hoc shape checks” drifting across providers.

### Error model (typed, consistent)

Providers must throw `CloudProviderOperationError` for operational failures so callers can stop doing string parsing.

- Source: `electron/services/cloud/providers/cloudProviderErrors.ts`
- Include:
  - `providerKind`
  - `operation` (e.g. `uploadObject`, `downloadObject`, `listBackups`)
  - `target` when applicable (key/prefix/fileName)
  - `code` when known (`ENOENT`, `EEXIST`, etc.)
  - `cause` (preserve the original error)

#### Required errno semantics

- Missing remote object on download must surface as `code: "ENOENT"`.
- Conflicting upload when `overwrite=false` must surface as `code: "EEXIST"`.

Callers are allowed to branch on `error.code` and `isCloudProviderOperationError(error)`.

## Implementation checklist

### 1) Define provider types (shared)

- Update `shared/types/cloud.ts`
  - add provider kind (e.g. `"google-drive"`)
  - add a **safe** `providerDetails` union variant (account label, folder, etc.)

### 2) Main-process provider implementation

- Add provider module under:
  - `electron/services/cloud/providers/<provider>/...`
- Implement the provider interface used by `electron/services/cloud/CloudService.ts`.
- Prefer extending `BaseCloudStorageProvider` to keep backup IO (`uploadBackup`, `downloadBackup`, `listBackups`) consistent.
- Standardize errors:
  - throw `CloudProviderOperationError` for operational failures
  - preserve `ENOENT`/`EEXIST` semantics
  - do not rely on message string matching in callers

### 3) OAuth flow

- Implement `<Provider>AuthFlow` in main
- Store tokens via `DropboxTokenManager`-style token manager:
  - refresh handling
  - revocation / disconnect

### 4) Main IPC + preload bridge

- Add `connect<Provider>` channel and handler
- Use the standardized handler registration and Zod validators
- Expose a typed invoker in preload

### 5) Renderer service + store

- Add a `connect<Provider>()` method on `src/services/CloudService.ts`
- Add store action in `src/stores/cloud/useCloudStore.ts`
  - busy flags
  - success/error toasts
  - optional OS notifications (user-initiated only)

### 6) Settings UI

- Add a new provider tab (or convert “(soon)” to live) in the provider setup panel.
- Ensure that when a different provider is configured, setup actions are disabled with a callout.

### 7) Tests

- Add unit tests for:
  - token parsing/refresh logic
  - provider client retry logic
  - IPC contract consistency (channels wired + validators)

## References

- ADR-015: `docs/Architecture/ADRs/ADR_015_CLOUD_SYNC_AND_REMOTE_BACKUP.md`
- ADR-016: `docs/Architecture/ADRs/ADR_016_MULTI_DEVICE_SYNC_MODEL.md`
- ADR-021: `docs/Architecture/ADRs/ADR_021_CLOUD_PROVIDER_SELECTION_AND_SETTINGS_UI.md`
- Dropbox setup guide (reference implementation): `docs/Guides/CLOUD_SYNC_DROPBOX_SETUP.md`
