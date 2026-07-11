---
schema: "../../../config/schemas/doc-frontmatter.schema.json"
doc_title: "ADR-031: Packaging, Signing, and Notarization Policy"
summary: "Documents how Uptime Watcher is packaged for Windows/macOS/Linux, what is officially supported, and the current signing/notarization posture."
created: "2025-12-15"
last_reviewed: "2026-07-10"
doc_category: "guide"
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

✅ Accepted (packaging implemented; releases intentionally unsigned)

## Context

Uptime Watcher ships to multiple platforms.

Packaging is produced via electron-builder and published as GitHub Release assets.

Some platforms _require_ code signing / notarization for a high-quality user
experience and, in practice, for frictionless installation and updates.

## Decision drivers

1. **Broad distribution**: users install on Windows/macOS/Linux.
2. **Operational simplicity**: CI must produce consistent artifacts.
3. **Operational cost**: publishing must not depend on paid platform developer
   accounts or managed signing services.
4. **Transparency**: users must not be led to believe unsigned artifacts have a
   verified publisher identity.

## Decision

### 1) Packaging via Electron Builder

Primary packaging configuration lives in:

- `electron-builder.config.ts`

Supported targets (current configuration)

> Note: electron-builder can produce many installer/archive formats. For
> support and QA purposes, we treat a smaller subset as “first-class” release
> artifacts. Others may still be built and uploaded by CI for convenience.

- Windows: NSIS, NSIS-web, MSI, ZIP/7z, portable, Squirrel, tar.\*
- macOS: DMG, PKG, ZIP, tar.\*
- Linux: AppImage, deb, rpm, snap, pacman, apk, zip, tar.\*

First-class formats (policy):

- Windows: NSIS + MSI
- macOS: DMG
- Linux: AppImage + deb

### 2) Release publishing via GitHub Actions

CI builds artifacts and uploads them to GitHub Releases.

Asset naming and upload rules are governed by:

- ADR-025: Release Asset Naming and Upload Strategy

### 3) Code signing / notarization posture

#### 3.1) Current implementation

- Windows and macOS release artifacts are intentionally unsigned.
- Electron Builder has code-signing enforcement disabled. The macOS identity is
  explicitly `null`, notarization is disabled, and CI disables certificate
  auto-discovery so runner state cannot change the result.
- The release workflow does not require signing secrets or claim that uploaded
  artifacts have a verified publisher identity.
- Release artifacts still include updater SHA-512 metadata, GitHub asset
  digests, and a CycloneDX SBOM. These detect corruption and identify release
  contents, but they do not provide publisher authentication.

#### 3.2) Unsigned release policy

- Windows users should expect an unknown-publisher or SmartScreen warning.
- macOS users should expect Gatekeeper to block or warn on first launch and may
  need to approve the app manually in system settings.
- Seamless macOS auto-update installation is not guaranteed for unsigned apps.
- Release notes and documentation must not describe these artifacts as signed,
  notarized, or publisher-verified.
- Adding signing later is an opt-in policy change that requires credentials,
  restored platform verification steps, and an ADR update.

##### Linux

- Linux artifacts are not code-signed in the Electron sense.
- Distribution-specific signing (e.g. deb/rpm repository signing, Flatpak
  repository signing) may be applied depending on distribution channel.

### 4) Flatpak packaging

Flatpak packaging is defined separately via:

- `flatpak-build.yml`

Flatpak is treated as an additional distribution format with its own build pipeline constraints.

## Consequences

- **Pro**: broad platform coverage from a single configuration source.
- **Pro**: releases do not depend on paid signing accounts or external signing
  services.
- **Con**: users receive operating-system trust warnings and cannot verify the
  publisher through an Authenticode or Apple Developer ID signature.
- **Con**: macOS installation and auto-update behavior has additional friction.

## Related ADRs

- ADR-025: Release Asset Naming and Upload Strategy
- ADR-027: Auto-Update Strategy and Release Channels
