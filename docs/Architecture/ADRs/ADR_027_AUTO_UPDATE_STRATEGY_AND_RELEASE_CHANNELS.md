---
schema: "../../../config/schemas/doc-frontmatter.schema.json"
doc_title: "ADR-027: Auto-Update Strategy and Release Channels"
summary: "Documents the auto-update implementation in Electron main, the update feed expectations, and how GitHub Releases artifacts map to update channels."
created: "2025-12-15"
last_reviewed: "2025-12-16"
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

- the renderer requests update operations via IPC
- main performs update checks/downloads
- main publishes update state/events back to renderer

### 2) Update feed via GitHub Releases

CI produces platform-specific update metadata files.

Release artifacts must include:

- `latest.yml` (and platform-specific variants such as `latest-win32.yml`)
- any target-specific metadata required by the updater implementation

### 3) Rollout / channel policy

The project uses semantic versions and Git tags.

Channel policy (current):

- stable releases are tagged and uploaded to GitHub Releases

Pre-release channels can be introduced later, but must have explicit rules for:

- version naming
- which artifacts are uploaded
- whether auto-update consumes them by default

## Implementation notes

- Main updater service:
  - `electron/services/updater/AutoUpdaterService.ts`
- Release upload invariants:
  - ADR-025

## Consequences

- **Pro**: update logic is centralized and testable.
- **Con**: CI must maintain strict artifact naming and metadata generation.

## Related ADRs

- ADR-025: Release Asset Naming and Upload Strategy
- ADR-026: Electron Security Model and Renderer Isolation
