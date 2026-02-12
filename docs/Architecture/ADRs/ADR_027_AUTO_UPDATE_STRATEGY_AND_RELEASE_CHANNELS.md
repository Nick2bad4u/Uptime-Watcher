---
schema: "../../../config/schemas/doc-frontmatter.schema.json"
doc_title: "ADR-027: Auto-Update Strategy and Release Channels"
summary: "Documents the auto-update implementation in Electron main, the update feed expectations, and how GitHub Releases artifacts map to update channels."
created: "2025-12-15"
last_reviewed: "2026-02-11"
doc_category: "guide"
author: "Nick2bad4u"
tags:
 - "uptime-watcher"
 - "architecture"
 - "adr"
 - "updates"
 - "electron"
 - "github-releases"
 - "squirrel"
 - "nsis"
---

# ADR-027: Auto-Update Strategy and Release Channels

## Status

✅ Accepted (implemented)

## Context

Uptime Watcher distributes builds via GitHub Releases and uses an Electron main-process auto-updater service.

Auto-updaters have constraints:

- update checks must not block the UI
- update feeds are platform-specific
- errors must be surfaced safely and logged without leaking secrets

## Decision drivers

1. **Reliability**: update checks must be resilient to network issues.
2. **Consistency**: update behavior must be the same across Windows/macOS/Linux where supported.
3. **Release hygiene**: CI must publish required update metadata (e.g. `latest*.yml`).

## Decision

### 1) Main-process updater service

Update functionality lives in Electron main as a service.

- main performs update checks/downloads
- main publishes update state/events back to renderer
- the renderer may request only the final install step (quit + install) via IPC

Current behavior:

- The app performs an update check at startup (best-effort).
- The renderer receives status via the `updateStatus` renderer event channel.
- The renderer does not currently trigger an on-demand update check.

### 2) Update feed via GitHub Releases

CI produces platform-specific update metadata files.

Release artifacts must include:

- `latest.yml` (and platform-specific variants such as `latest-win32.yml`)
- any target-specific metadata required by the updater implementation

Integrity metadata:

- `latest*.yml` must contain correct `sha512` values that match the uploaded
  binaries.
- Differential update metadata (`*.blockmap`) must be uploaded when produced.

### 3) Rollout / channel policy

The project uses semantic versions and Git tags.

Channel policy (current):

- stable releases are tagged and uploaded to GitHub Releases

Staged rollouts (required for stable):

- Stable releases must support staged rollout using the
  `stagingPercentage` mechanism in update metadata.
- Rollout percentages must be increased explicitly (for example, 10% → 50% →
  100%) based on observed crash/error rates.

Note: staged rollout configuration is a release-pipeline responsibility. It is
not currently controlled by the Settings UI.

Channel switching (not yet implemented):

- The app currently consumes stable releases only.
- If a beta/alpha channel is introduced, it must be an explicit user choice
  persisted in settings and validated in Electron main.
- Channel switching must never mix artifacts across channels.

Version naming rules (required for prerelease channels):

- beta: `X.Y.Z-beta.N`
- alpha: `X.Y.Z-alpha.N`

Pre-release channels can be introduced later, but must have explicit rules for:

- version naming
- which artifacts are uploaded
- whether auto-update consumes them by default

Stable must remain the default.

### 4) Signature verification requirements

Production auto-updates must only install signed builds.

Requirements:

- Windows installers must be Authenticode signed and the updater must verify
  signatures against the expected publisher identity.
- macOS builds must be code signed and notarized.
- If signing is not available for a build, that build must not be marked as the
  latest release for auto-update consumption.

## Implementation notes

- Main updater service:
  - `electron/services/updater/AutoUpdaterService.ts`
- Update status bridging:
  - `electron/services/application/ApplicationService.ts` (emits update status events)
  - `electron/services/ipc/handlers/systemHandlers.ts` (quitAndInstall IPC)
- Release upload invariants:
  - ADR-025

## Consequences

- **Pro**: update logic is centralized and testable.
- **Con**: CI must maintain strict artifact naming and metadata generation.

## Related ADRs

- ADR-025: Release Asset Naming and Upload Strategy
- ADR-026: Electron Security Model and Renderer Isolation
