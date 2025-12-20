---
schema: "../../config/schemas/doc-frontmatter.schema.json"
title: "Google Drive Cloud Sync Setup"
summary: "Setup guide for using Google Drive as a first-class Cloud Sync provider (OAuth 2.0 + PKCE + loopback redirect, no backend server)."
created: 2025-12-15
last_reviewed: 2025-12-16
category: "guide"
author: "Nick2bad4u"
tags:
 - cloud
 - sync
 - backups
 - google-drive
 - oauth
 - pkce
---

# Google Drive Cloud Sync Setup

This document explains how to configure Google OAuth credentials so Uptime Watcher can use **Google Drive** as a first-class cloud provider.

## Status

Implemented.

Google Drive uses **Google Drive appDataFolder** so backups and sync artifacts are stored in the app’s private storage area (not a user-visible folder).

## Design constraints (must not regress)

- **System browser OAuth** only (no embedded auth webviews).
- **OAuth 2.0 Authorization Code + PKCE**.
- **Loopback redirect** (local HTTP server bound to a loopback interface) — no backend service.
- **No secrets in the renderer**. Tokens and refresh tokens live in Electron main and are stored via the existing `SecretStore` abstraction.

## What you will need (as the app maintainer)

- A Google Cloud project
- An OAuth 2.0 Client ID for a desktop application (or the approach we standardize on for Electron)
- A clear list of **scopes** limited to what the provider implementation requires

> Important
>
> Treat any Google OAuth client secret as _non-confidential_ for a desktop app. The app should be designed as a **public client** (PKCE). Never rely on a client secret staying secret.

## Environment variables (optional override)

The app ships with a default Google OAuth client id (and its associated client
secret) and end users do not need to configure anything.

These variables are still read from `process.env` in the Electron main process
and take precedence when set:

- `UPTIME_WATCHER_GOOGLE_CLIENT_ID`
- `UPTIME_WATCHER_GOOGLE_CLIENT_SECRET` (optional override; if you override the
  client id and your OAuth app requires a secret, you must override this too)

### Example: local development override

The Electron main process reads these from `process.env`.

Set environment variables in your shell before starting the app (only needed if
you want to use a different Google OAuth app).

PowerShell:

```powershell
$env:UPTIME_WATCHER_GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com"
$env:UPTIME_WATCHER_GOOGLE_CLIENT_SECRET = "OPTIONAL_CLIENT_SECRET"
npm run dev
```

bash/zsh:

```bash
export UPTIME_WATCHER_GOOGLE_CLIENT_ID="YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com"
export UPTIME_WATCHER_GOOGLE_CLIENT_SECRET="OPTIONAL_CLIENT_SECRET"
npm run dev
```

## Redirect URI strategy

Uptime Watcher uses a loopback HTTP server bound to a loopback interface.

### Redirect URI values

For **Google Drive**, Uptime Watcher uses a **pathless** loopback redirect URI (per Google’s native-app guidance):

```text
http://127.0.0.1:53682
```

> Note
>
> Whether you must explicitly configure “Authorized redirect URIs” depends on the
> **OAuth client type**:
>
> - **Desktop app** clients typically accept loopback redirects without listing
>   a fixed redirect URI.
> - **Web application** clients typically require an exact redirect URI string.
>
> If you use a web client anyway, you must configure an exact redirect URI that
> matches what the app uses.

## Scopes

Uptime Watcher requests the following scopes:

- `https://www.googleapis.com/auth/drive.appdata` (store data in `appDataFolder`)
- `openid`, `email`, `profile` (used to fetch and display the connected account label)

## Storage behavior

- All objects are stored under Google Drive `appDataFolder`.
- Uptime Watcher creates an internal root folder named `uptime-watcher/` under `appDataFolder`.
- Backup metadata is stored alongside backups as `*.metadata.json` sidecar files.

## Related references

- ADR-021: `docs/Architecture/ADRs/ADR_021_CLOUD_PROVIDER_SELECTION_AND_SETTINGS_UI.md`
- Dropbox guide (reference implementation): `docs/Guides/CLOUD_SYNC_DROPBOX_SETUP.md`
- Cloud provider architecture: `docs/Architecture/ADRs/ADR_015_CLOUD_SYNC_AND_REMOTE_BACKUP.md`
