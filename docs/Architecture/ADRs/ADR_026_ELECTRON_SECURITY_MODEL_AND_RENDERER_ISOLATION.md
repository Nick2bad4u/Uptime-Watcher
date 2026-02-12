---
schema: "../../../config/schemas/doc-frontmatter.schema.json"
doc_title: "ADR-026: Electron Security Model and Renderer Isolation"
summary: "Defines the Electron security posture: renderer isolation via preload bridge, webPreferences hardening, navigation restrictions, and safe external link handling."
created: "2025-12-15"
last_reviewed: "2026-02-11"
doc_category: "guide"
author: "Nick2bad4u"
tags:
 - "uptime-watcher"
 - "architecture"
 - "adr"
 - "electron"
 - "security"
 - "preload"
 - "ipc"
 - "csp"
---

# ADR-026: Electron Security Model and Renderer Isolation

## Status

✅ Accepted (implemented)

## Context

Uptime Watcher is an Electron app. The renderer is a large JavaScript surface area and must be treated as untrusted compared to Electron main.

The app must prevent common Electron security failures:

- renderer access to Node.js primitives
- arbitrary navigation to remote origins
- unvalidated IPC calls
- unsafe `window.open` behavior

## Decision drivers

1. **Least privilege**: renderer must not have Node.js access.
2. **Defense in depth**: even if the renderer is compromised, secrets should remain protected.
3. **Predictability**: navigation rules must be consistent across windows.
4. **Maintainability**: security posture must be centralized, not scattered.

## Decision

### 1) Renderer isolation via preload bridge

All renderer-to-main access is performed via a preload bridge.

- Renderer uses a typed API surface (domain-style APIs).
- Main validates payloads.
- Main never exposes secrets to the renderer.

### 2) BrowserWindow security defaults

BrowserWindow webPreferences must enforce:

- `nodeIntegration: false`
- `contextIsolation: true`
- `webSecurity: true`
- `allowRunningInsecureContent: false`
- `webviewTag: false`
- `nodeIntegrationInSubFrames: false`
- `nodeIntegrationInWorker: false`

The app currently sets `sandbox: true` in the main window configuration.

Additionally, the app denies permission requests by default (microphone,
camera, notifications, screen capture, etc.) using session permission handlers.

> Note: when the Chromium sandbox is enabled, the preload layer must remain
> conservative about dependencies and should not rely on Node.js built-ins.
> The preload bridge should continue to expose only the typed, minimal
> `window.electronAPI` surface.

### 3) Navigation and window-opening

- The renderer must not be allowed to navigate to arbitrary external origins.
- `window.open()` must not create new BrowserWindows.
- External links open via the OS (`shell.openExternal`) only after URL
  validation.

If new windows are allowed (rare), the app must restrict them to known-safe routes/origins.

### 4) IPC security

IPC must follow the standardized request/response handler model.

- All payloads validated (Zod)
- No ad-hoc channels
- No renderer access to Node APIs

Handler registration rules:

- Use the standardized IPC registrar (`createStandardizedIpcRegistrar`).
- Channels that accept parameters must provide a runtime validator.
- Reject invocations that include unexpected parameters for no-param channels.
- Correlation IDs are carried in the IPC envelope and must be treated as
  untrusted input.

External-open rules (IPC and navigation interception):

- External URLs must be validated and logged only using safe-for-logging
  variants.
- OAuth authorization URLs must be HTTPS-only and allow-listed (see ADR-022).

## Implementation notes

- Window creation and hardening:
  - `electron/services/window/WindowService.ts`
  - Production-only CSP/security headers are attached via
    `session.webRequest.onHeadersReceived` in `WindowService`.
- External navigation validation:
  - `electron/services/shell/validatedExternalOpen.ts`
- App entry and lifecycle:
  - `electron/main.ts`
- IPC protocols:
  - ADR-005 and shared channel maps
  - `electron/services/ipc/utils.ts` (standard registrar + validation enforcement)

## Consequences

- **Pro**: reduces blast radius of renderer compromise.
- **Pro**: security decisions are reviewable and centralized.
- **Pro**: renderer sandboxing is enabled, reducing the blast radius of renderer compromise.

## Related ADRs

- ADR-005: IPC Communication Protocol
- ADR-009: Validation Strategy
- ADR-023: Secret Storage and Encryption Policy
- ADR-021: Cloud Provider Selection and Settings UI
