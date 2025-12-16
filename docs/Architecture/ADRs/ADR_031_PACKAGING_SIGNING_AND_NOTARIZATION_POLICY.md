---
schema: "../../../config/schemas/doc-frontmatter.schema.json"
title: "ADR-031: Packaging, Signing, and Notarization Policy"
summary: "Documents how Uptime Watcher is packaged for Windows/macOS/Linux, what is officially supported, and the current signing/notarization posture."
created: "2025-12-15"
last_reviewed: "2025-12-15"
category: "guide"
author: "Nick2bad4u"
tags:
  - "uptime-watcher"
  - "architecture"
  - "adr"
  - "releases"
  - "packaging"
  - "electron-builder"
  - "signing"
  - "notarization"
  - "windows"
  - "macos"
  - "linux"
---

# ADR-031: Packaging, Signing, and Notarization Policy

## Status

✅ Accepted (packaging implemented; signing posture documented)

## Context

Uptime Watcher ships to multiple platforms.

Packaging is produced via electron-builder and published as GitHub Release assets.

Some platforms require code signing / notarization for a high-quality user experience.

## Decision drivers

1. **Broad distribution**: users install on Windows/macOS/Linux.
2. **Operational simplicity**: CI must produce consistent artifacts.
3. **Security**: signing keys must never be committed.
4. **User trust**: signed builds reduce warnings and improve install experience.

## Decision

### 1) Packaging via Electron Builder

Primary packaging configuration lives in:

- `electron-builder.config.ts`

Supported targets (current):

- Windows: NSIS, NSIS-web, MSI, ZIP/7z, portable, Squirrel, tar.\*
- macOS: DMG, PKG, ZIP, tar.\*
- Linux: AppImage, deb, rpm, snap, pacman, apk, zip, tar.\*

### 2) Release publishing via GitHub Actions

CI builds artifacts and uploads them to GitHub Releases.

Asset naming and upload rules are governed by:

- ADR-025: Release Asset Naming and Upload Strategy

### 3) Code signing / notarization posture

Current state:

- CI builds are **not guaranteed to be signed/notarized** unless signing secrets are configured.

Policy:

- signing and notarization credentials must be stored as CI secrets
- workflow changes that affect signing must be documented and reviewed
- unsigned builds are allowed but should be considered a degraded UX

### 4) Flatpak packaging

Flatpak packaging is defined separately via:

- `flatpak-build.yml`

Flatpak is treated as an additional distribution format with its own build pipeline constraints.

## Consequences

- **Pro**: broad platform coverage from a single configuration source.
- **Pro**: clear security boundary for signing keys.
- **Con**: without signing/notarization secrets, users may see OS warnings.

## Related ADRs

- ADR-025: Release Asset Naming and Upload Strategy
- ADR-027: Auto-Update Strategy and Release Channels
