---
schema: "../../config/schemas/doc-frontmatter.schema.json"
title: "Google Drive Cloud Sync Setup (Planned)"
summary: "Planning guide for adding Google Drive as a first-class Cloud Sync provider (OAuth 2.0 + PKCE + loopback redirect, no backend server)."
created: 2025-12-15
last_reviewed: 2025-12-15
category: "guide"
author: "Nick2bad4u"
tags:
  - cloud
  - sync
  - backups
  - google-drive
  - oauth
  - pkce
  - roadmap
---

# Google Drive Cloud Sync Setup (Planned)

This document is a **pre-implementation** guide to prepare the project for a first-class **Google Drive** cloud provider.

## Status

Not yet implemented.

The Settings UI includes a **Google Drive (soon)** provider tab (see ADR-021).

## Design constraints (must not regress)

- **System browser OAuth** only (no embedded auth webviews).
- **OAuth 2.0 Authorization Code + PKCE**.
- **Loopback redirect** (local HTTP server bound to localhost) — no backend service.
- **No secrets in the renderer**. Tokens and refresh tokens live in Electron main and are stored via the existing `SecretStore` abstraction.

## What you will need (as the app maintainer)

- A Google Cloud project
- An OAuth 2.0 Client ID for a desktop application (or the approach we standardize on for Electron)
- A clear list of **scopes** limited to what the provider implementation requires

> Important
>
> Treat any Google OAuth client secret as _non-confidential_ for a desktop app. The app should be designed as a **public client** (PKCE). Never rely on a client secret staying secret.

## Planned environment variables

These are placeholders to keep naming consistent across providers:

- `UPTIME_WATCHER_GOOGLE_CLIENT_ID`
- `UPTIME_WATCHER_GOOGLE_CLIENT_SECRET` (optional; if used, treat as non-secret)

### Example: local development configuration

Add the values to your local config source (for example `node.config.json` in the repo root) so the Electron main process can read them at runtime.

```json
{
  "UPTIME_WATCHER_GOOGLE_CLIENT_ID": "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com",
  "UPTIME_WATCHER_GOOGLE_CLIENT_SECRET": "OPTIONAL_CLIENT_SECRET"
}
```

## Redirect URI strategy

The Dropbox provider uses a loopback redirect on a fixed port.

For consistency across providers, we intend to:

- reuse the same loopback server/port where possible, and
- use **provider-specific paths** (e.g. `/oauth2/callback?provider=google-drive` or `/oauth2/google/callback`).

The final URI must be aligned with the Google OAuth client configuration.

### Example: redirect URI values (illustrative)

The Dropbox provider currently uses a fixed loopback port. If we keep the same port for Google Drive, the Google OAuth app configuration will need to allow something like:

```text
http://127.0.0.1:53682/oauth2/callback
http://localhost:53682/oauth2/callback
```

Exact URIs may change if we introduce provider-specific callback paths.

## Related references

- ADR-021: `docs/Architecture/ADRs/ADR_021_CLOUD_PROVIDER_SELECTION_AND_SETTINGS_UI.md`
- Dropbox guide (reference implementation): `docs/Guides/CLOUD_SYNC_DROPBOX_SETUP.md`
- Cloud provider architecture: `docs/Architecture/ADRs/ADR_015_CLOUD_SYNC_AND_REMOTE_BACKUP.md`
