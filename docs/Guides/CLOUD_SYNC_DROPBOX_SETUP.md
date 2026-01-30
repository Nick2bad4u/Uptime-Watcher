---
schema: "../../config/schemas/doc-frontmatter.schema.json"
title: "Dropbox Cloud Sync Setup"
summary: "How to configure the Dropbox OAuth app and use Dropbox Cloud Sync in Uptime Watcher (PKCE + loopback redirect, no backend server)."
created: 2025-12-14
last_reviewed: 2025-12-14
category: "guide"
author: "Nick2bad4u"
tags:
 - cloud
 - sync
 - backups
 - dropbox
---

# Dropbox Cloud Sync Setup

This app uses **Dropbox OAuth 2.0 Authorization Code + PKCE** with a **loopback redirect** (system browser, no embedded webview, no backend server).

## Quick start (user flow)

1. Open **Settings → Cloud Sync & Backup**.
2. Click **Connect Dropbox**.
3. Your browser opens. Sign in and approve the permissions.
4. The app stores tokens locally (encrypted) and sync/backup features become available.

## What you need (as the app maintainer)

- A Dropbox "Scoped app" (recommended)
- The **App Key** (client_id)

> Important
>
> - Do **not** ship or commit a Dropbox **developer access token**.
> - Treat the **App Secret** as compromised if it has ever been posted publicly. Rotate it.
>
> The desktop app is a **public client**. With PKCE, the OAuth flow does not require keeping an app secret confidential.

## Do we need webhooks?

No.

Dropbox webhooks require a **publicly reachable HTTPS endpoint** to receive callbacks.
Since the app is fully local (no server), webhooks are not a fit.

Instead, the app provides:

- a status section (connected account label, last sync/backup timestamps)
- explicit user actions like **Sync now**, **Upload backup**, **Restore**, and maintenance tools

If you want “popups”, do it locally (toast/snackbar or OS notification) when a sync completes/fails.
Do not add Dropbox webhooks unless you introduce a backend.

## Dropbox app console configuration

### Redirect URI

The app uses a fixed loopback redirect so that the Dropbox console can be configured once.

Add the following redirect URI:

- `http://localhost:53682/oauth2/callback`

> Important
>
> Dropbox requires an **exact string match** for the redirect URI.
> If you only configure `http://127.0.0.1:53682/oauth2/callback`, Dropbox will
> reject the request because the app submits `http://localhost:53682/oauth2/callback`.

No webhook URI is required.

### 127.0.0.1 vs localhost

Use **`localhost`**.

Dropbox allows non-HTTPS redirect URIs only for localhost loopback redirects.
To make this reliable across environments (where `localhost` may resolve to
`127.0.0.1` or `::1`), the app binds the loopback callback server to **both**
IPv4 and IPv6 loopback addresses.

If you want an extra safety net in the Dropbox console, you may register both
values:

- `http://localhost:53682/oauth2/callback`
- `http://127.0.0.1:53682/oauth2/callback`

The app still uses the `localhost` redirect URI.

### Troubleshooting: invalid_redirect_uri

If your browser shows an error like:

`https://www.dropbox.com/oauth2/authorize_error?error_name=invalid_redirect_uri`

Open your Dropbox app’s **Redirect URIs** list and confirm it contains:

- `http://localhost:53682/oauth2/callback`

### Scopes / permissions

The app needs the following scopes:

- `account_info.read` (to show the connected account label)
- `files.metadata.read`
- `files.content.read`
- `files.content.write`

Using a **Scoped app folder** is recommended so access is limited to the app’s folder.

> Note
>
> If you change scopes after users already connected, they must **Disconnect** and
> **Connect Dropbox** again to get a token with the new scopes.

### Disconnect behavior (token revocation)

When the user clicks **Disconnect**, the app attempts to revoke the current
Dropbox access token via `auth/token/revoke` (best-effort), and then deletes the
locally stored tokens.

## Runtime configuration

### App key

The app ships with a default Dropbox App Key. You may override it for development/builds using:

- `UPTIME_WATCHER_DROPBOX_APP_KEY`

#### Example (PowerShell)

```powershell
$env:UPTIME_WATCHER_DROPBOX_APP_KEY = "<your_app_key>"
npm run dev
```

#### Example (bash/zsh)

```bash
export UPTIME_WATCHER_DROPBOX_APP_KEY="<your_app_key>"
npm run dev
```

### Notes

- Tokens are stored locally and encrypted using Electron `safeStorage`.
- OAuth uses the user’s system browser and a local loopback HTTP callback.
