---
schema: "../../../config/schemas/doc-frontmatter.schema.json"
title: "ADR-026: Electron Security Model and Renderer Isolation"
summary: "Defines the Electron security posture: renderer isolation via preload bridge, webPreferences hardening, navigation restrictions, and safe external link handling."
created: "2025-12-15"
last_reviewed: "2025-12-15"
category: "guide"
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

The app currently sets `sandbox: false` due to preload integration constraints.

This is an explicit tradeoff and must be revisited when sandboxing is feasible without breaking the preload bridge.

### 3) Navigation and window-opening

- The renderer must not be allowed to navigate to arbitrary external origins.
- External links should open via the OS (`shell.openExternal`).

If new windows are allowed (rare), the app must restrict them to known-safe routes/origins.

### 4) IPC security

IPC must follow the standardized request/response handler model.

- all payloads validated (Zod)
- no ad-hoc channels
- no renderer access to Node APIs

## Implementation notes

- Window creation and hardening:
  - `electron/services/window/WindowService.ts`
- App entry and lifecycle:
  - `electron/main.ts`
- IPC protocols:
  - ADR-005 and shared channel maps

## Consequences

- **Pro**: reduces blast radius of renderer compromise.
- **Pro**: security decisions are reviewable and centralized.
- **Con**: sandboxing is not enabled today; enabling it later may require preload refactors.

## Related ADRs

- ADR-005: IPC Communication Protocol
- ADR-009: Validation Strategy
- ADR-023: Secret Storage and Encryption Policy
- ADR-021: Cloud Provider Selection and Settings UI
