---
schema: "../../config/schemas/doc-frontmatter.schema.json"
title: "OneDrive Cloud Sync Setup (Planned)"
summary: "Planning guide for adding OneDrive as a first-class Cloud Sync provider (Microsoft identity platform OAuth 2.0 + PKCE + loopback redirect)."
created: 2025-12-15
last_reviewed: 2025-12-15
category: "guide"
author: "Nick2bad4u"
tags:
  - cloud
  - sync
  - backups
  - onedrive
  - oauth
  - pkce
  - roadmap
---

# OneDrive Cloud Sync Setup (Planned)

This document is a **pre-implementation** guide to prepare the project for a first-class **OneDrive** cloud provider.

## Status

Not yet implemented.

The Settings UI includes a **OneDrive (soon)** provider tab (see ADR-021).

## Design constraints (must not regress)

- **System browser OAuth** only (no embedded auth webviews).
- **OAuth 2.0 Authorization Code + PKCE**.
- **Loopback redirect** (local HTTP server bound to localhost).
- **No secrets in the renderer**. Tokens and refresh tokens live in Electron main and are stored via the existing `SecretStore` abstraction.

## What you will need (as the app maintainer)

- A Microsoft Entra ID (Azure AD) app registration
- Configured redirect URIs matching the loopback redirect approach
- The correct Microsoft Graph scopes required for file read/write in the selected OneDrive folder

## Planned environment variables

Placeholders to keep naming consistent across providers:

- `UPTIME_WATCHER_ONEDRIVE_CLIENT_ID`
- `UPTIME_WATCHER_ONEDRIVE_TENANT` (optional, depending on whether we use multi-tenant)

### Example: local development configuration

Add the values to your local config source (for example `node.config.json` in the repo root):

```json
{
  "UPTIME_WATCHER_ONEDRIVE_CLIENT_ID": "YOUR_AZURE_APP_CLIENT_ID",
  "UPTIME_WATCHER_ONEDRIVE_TENANT": "common"
}
```

## Redirect URI strategy

For consistency across providers, we intend to:

- reuse the same loopback server/port where possible, and
- use provider-specific paths or query parameters to disambiguate callbacks.

### Example: redirect URI values (illustrative)

If we reuse the existing loopback port, an Entra ID app registration would need to allow something like:

```text
http://127.0.0.1:53682/oauth2/callback
http://localhost:53682/oauth2/callback
```

Exact URIs may change if we introduce provider-specific callback paths.

## Related references

- ADR-021: `docs/Architecture/ADRs/ADR_021_CLOUD_PROVIDER_SELECTION_AND_SETTINGS_UI.md`
- Dropbox guide (reference implementation): `docs/Guides/CLOUD_SYNC_DROPBOX_SETUP.md`
- Cloud provider architecture: `docs/Architecture/ADRs/ADR_015_CLOUD_SYNC_AND_REMOTE_BACKUP.md`
