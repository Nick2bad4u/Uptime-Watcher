---
schema: "../../../config/schemas/doc-frontmatter.schema.json"
title: "ADR-025: Release Asset Naming and Upload Strategy"
summary: "Documents release artifact naming invariants and CI upload rules for GitHub Releases (including Squirrel/RELEASES/nupkg collisions and basename uniqueness)."
created: "2025-12-15"
last_reviewed: "2025-12-15"
category: "guide"
author: "Nick2bad4u"
tags:
 - "uptime-watcher"
 - "architecture"
 - "adr"
 - "releases"
 - "github-actions"
 - "ci"
 - "electron-builder"
 - "squirrel"
 - "windows"
---

# ADR-025: Release Asset Naming and Upload Strategy

## Status

✅ Accepted (implemented)

## Context

CI builds generate multiple platform artifacts (Windows x64/ia32, macOS, Linux).

GitHub Release assets are keyed by **asset name** (basename), not by folder path.

If two artifacts share the same basename, GitHub treats them as the “same asset,” causing upload tooling to replace/delete assets.

This can produce flaky failures when concurrent jobs attempt to delete/replace the same asset.

## Decision drivers

1. **Deterministic CI**: release upload must succeed reliably.
2. **Traceability**: artifact names must encode platform/arch.
3. **Compatibility**: preserve update metadata files (`latest*.yml`, Squirrel `RELEASES`).

## Decision

### 1) Basename uniqueness is required

Before uploading release assets, CI must ensure:

- there are no duplicate basenames across all files being uploaded

### 2) Squirrel Windows collisions must be normalized

Squirrel produces files whose names may collide between architectures:

- `RELEASES`
- `*-full.nupkg`

Policy:

- rename ia32 `RELEASES` → `RELEASES-win32`
- rename ia32 `*-full.nupkg` → `*-win32-full.nupkg`
- update `RELEASES-win32` contents to reference the renamed `.nupkg`

### 3) CI upload happens from an aggregated artifact set

Release upload is performed from a single aggregated “release-dist” directory after all platform builds are collected.

CI must:

- rename/canonicalize artifacts
- validate basename uniqueness
- upload assets

## Implementation notes

- Workflow: `.github/workflows/Build.yml`
- The workflow includes a basename-duplicate detector that fails early with the list of colliding filenames.

## Alternatives considered

### A) Remove Squirrel builds

Pros:

- fewer artifacts
- fewer collision classes

Cons:

- may remove older update flows

## Consequences

- **Pro**: avoids hard-to-debug “delete asset” / “update asset” failures.
- **Pro**: Windows artifacts remain distinct per arch.
- **Con**: the workflow must maintain renaming rules for any artifact format that produces non-unique names.

## Related ADRs

- ADR-007: Service Container and Dependency Injection (mentions AutoUpdaterService)
