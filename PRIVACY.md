# Privacy Policy

## Overview

Uptime Watcher is a local-first desktop application. The project does not
operate an Uptime Watcher account service, analytics service, advertising
service, or telemetry endpoint. It does not automatically upload application
logs, diagnostics, monitor history, or configuration to the project maintainer.

## Data Stored On The Device

The application stores monitor configuration, status history, settings, logs,
and local backup data on the user's device. Monitor URLs, hostnames, credentials,
and history may be sensitive. Users control the device, operating-system account,
backup locations, and retention settings that protect this information.

OAuth tokens and similar provider credentials are stored using the available
operating-system credential facilities. Logs are designed to redact credentials
and sensitive URL components, but exported logs and diagnostic bundles may
still contain operational details and should be reviewed before sharing.

## User-Directed Network Activity

The application transfers information to other systems only when required for a
feature configured or requested by the user. This can include:

- contacting websites, APIs, hosts, DNS services, certificate endpoints, or
  WebSocket services selected for monitoring;
- automatically checking GitHub for Uptime Watcher updates and downloading
  update data according to the application's updater behavior;
- authenticating with and transferring encrypted or unencrypted backup and sync
  data to a user-selected Dropbox or Google Drive account; and
- opening external documentation or provider authorization pages at the user's
  request.

The operators of those services receive network and account information under
their own policies. Relevant third-party policies include the
[GitHub Privacy Statement](https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement),
[Google Privacy Policy](https://policies.google.com/privacy), and
[Dropbox Privacy Policy](https://www.dropbox.com/privacy).

## Cloud Backup And Synchronization

Cloud backup and synchronization are optional. The user chooses the provider,
authorizes the provider account, and initiates or configures transfers. Remote
artifacts can contain monitor configuration and history. Client-side encryption
is available and recommended for sensitive remote backups.

Disabling a provider connection prevents new transfers but does not necessarily
delete data already stored by that provider. Users must use the provider's
controls to review or delete remote files and revoke account authorization.

## Diagnostics And Support

Logs and diagnostics stay on the device unless the user explicitly exports or
shares them. The project does not receive those files automatically. Users
should not include secrets or private monitor details in public GitHub issues.

## Changes

Material changes to data collection or transfers must be documented here before
release. Any future Uptime Watcher-controlled telemetry must be explicitly
opt-in and exposed through a dedicated application setting.

Questions or security reports can be submitted through the channels described
in [SECURITY.md](SECURITY.md).
