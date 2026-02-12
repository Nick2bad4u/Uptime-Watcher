---
schema: "../../../config/schemas/doc-frontmatter.schema.json"
doc_title: "ADR-025: Release Asset Naming and Upload Strategy"
summary: "Documents release artifact naming invariants and CI upload rules for GitHub Releases (including Squirrel/RELEASES/nupkg collisions and basename uniqueness)."
created: "2025-12-15"
last_reviewed: "2026-02-11"
doc_category: "guide"
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
4. **Supply chain hygiene**: releases must be compatible with SBOM publication requirements.

## Decision

### 1) Basename uniqueness is required

Before uploading release assets, CI must ensure:

- there are no duplicate basenames across all files being uploaded

This rule applies to:

- installers and archives (`.exe`, `.msi`, `.dmg`, `.AppImage`, `.zip`, etc.)
- update metadata (`latest*.yml`)
- differential update data (`*.blockmap`)
- Squirrel metadata (`RELEASES`, `*.nupkg`)
- SBOM assets (see below)

### 2) Squirrel Windows collisions must be normalized

Squirrel produces files whose names may collide between architectures:

- `RELEASES`
- `*-full.nupkg`

Policy:

- rename ia32 `RELEASES` → `RELEASES-win32`
- rename ia32 `*-full.nupkg` → `*-win32-full.nupkg`
- update `RELEASES-win32` contents to reference the renamed `.nupkg`

This normalization exists because GitHub Releases treat asset basenames as the
unique identifier.

### 3) Electron updater metadata files must not collide

electron-builder generates update metadata with stable names that can collide
when multiple Windows architectures are published to the same GitHub Release.

Policy:

- rename Windows ia32 `latest.yml` → `latest-win32.yml`
- rename Windows ia32 `nsis-web/latest.yml` → `latest-nsis-web-win32.yml`
- keep Windows x64 `nsis-web/latest.yml` but rename it to the canonical
  `latest-nsis-web.yml`

For macOS, per-arch update metadata must also be unique:

- rename `latest-mac.yml` → `latest-${platform}-${arch}.yml`

These renames keep basenames unique while preserving electron-updater’s
expected metadata format.

### 4) CI upload happens from an aggregated artifact set

Release upload is performed from a single aggregated “release-dist” directory after all platform builds are collected.

CI must:

- rename/canonicalize artifacts
- validate basename uniqueness
- upload assets

After any rename/move of update metadata, CI must re-compute `sha512` fields
inside `latest*.yml` so the metadata matches the actual uploaded binaries.

This is required because electron-updater uses the `sha512` values for
integrity verification.

### 5) SBOM assets

Each production release must publish an SBOM as a release asset.

Minimum requirements:

- Format: SPDX JSON or CycloneDX JSON
- Must be generated from the exact commit/tag being released
- Must not include secrets (only package/component metadata)
- Asset names must be deterministic and must not collide by basename

Naming convention:

- `Uptime-Watcher-sbom-${version}.spdx.json` (preferred)
- optionally also: `Uptime-Watcher-sbom-${version}.cdx.json`

If per-platform SBOMs are generated, include platform and arch:

- `Uptime-Watcher-sbom-${platform}-${arch}-${version}.spdx.json`

## Implementation notes

- Workflow: `.github/workflows/Build.yml`
- The workflow includes a basename-duplicate detector that fails early with the list of colliding filenames.

Build sources of truth:

- electron-builder artifact names: `electron-builder.config.ts`
- updater metadata normalization and `sha512` fixups: `.github/workflows/Build.yml`

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
