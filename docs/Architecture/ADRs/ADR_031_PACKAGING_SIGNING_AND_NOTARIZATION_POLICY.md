---
schema: "../../../config/schemas/doc-frontmatter.schema.json"
doc_title: "ADR-031: Packaging, Signing, and Notarization Policy"
summary: "Documents how Uptime Watcher is packaged for Windows/macOS/Linux, what is officially supported, and the current signing/notarization posture."
created: "2025-12-15"
last_reviewed: "2026-02-12"
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

✅ Accepted (packaging implemented; release signing + notarization mandated)

## Context

Uptime Watcher ships to multiple platforms.

Packaging is produced via electron-builder and published as GitHub Release assets.

Some platforms _require_ code signing / notarization for a high-quality user
experience and, in practice, for frictionless installation and updates.

## Decision drivers

1. **Broad distribution**: users install on Windows/macOS/Linux.
2. **Operational simplicity**: CI must produce consistent artifacts.
3. **Security**: signing keys must never be committed.
4. **User trust**: signed builds reduce warnings and improve install experience.

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

#### 3.1) Current implementation reality (as of this review)

- The repo config enables macOS hardened runtime (`hardenedRuntime: true`) and
  Gatekeeper assessment (`gatekeeperAssess: true`).
- `forceCodeSigning` is currently `false`.
- The GitHub Actions build workflow does **not** currently configure signing or
  notarization secrets.

Cold hard truth: the current CI pipeline can produce unsigned/non-notarized
artifacts. That is acceptable for developer/CI validation builds, but it is not
acceptable for official releases consumed by end users.

#### 3.2) Mandated posture for official releases

Policy:

- **Official release assets must be signed** (Windows) and **signed + notarized**
  (macOS). Unsigned builds must not be published as “latest” for auto-update
  consumption (see ADR-027).
- Signing/notarization credentials must be stored as CI secrets (or managed
  signing services) and must never be committed.
- Workflow changes that affect signing/notarization must be documented and
  reviewed.

##### Windows (Authenticode + Windows App SDK mandate)

Minimum requirements for any Windows artifact distributed to end users:

- Authenticode-sign the primary executables (installer + shipped app binaries).
- Use SHA-256 signatures and timestamping.

Accepted approaches:

- Traditional PFX/P12 certificate provided to CI (as a secret) and used via
  `signtool.exe`.
- Managed signing (recommended for long-term hardening), e.g. Azure Trusted
  Signing / Key Vault-backed signing, with CI using OIDC.

Windows App SDK mandate (packaging direction):

- When distributing via enterprise policy / modern Windows install flows, the
  app must ship an **MSIX** package (or App Installer) produced via a Windows
  App SDK-compatible pipeline and signed with a trusted publisher identity.
- Until MSIX packaging is implemented, NSIS/MSI remain supported, but they must
  still be signed.

##### macOS (Developer ID + Notary Service)

Minimum requirements for any macOS artifact distributed to end users:

- Code sign the `.app` bundle with a **Developer ID Application** certificate.
- If distributing `.pkg` installers, sign them with a **Developer ID Installer**
  certificate.
- Notarize with Apple Notary Service and **staple** the notarization ticket.
- Hardened runtime must remain enabled.

Credential handling (modern, preferred):

- Prefer App Store Connect API keys (not Apple ID + password) for notarization.
- CI must use an ephemeral keychain and must remove certificates/keys at the end
  of the job.

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
- **Pro**: clear security boundary for signing keys.
- **Con**: without signing/notarization secrets, users may see OS warnings.

## Related ADRs

- ADR-025: Release Asset Naming and Upload Strategy
- ADR-027: Auto-Update Strategy and Release Channels
