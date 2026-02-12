---
schema: "../../../config/schemas/doc-frontmatter.schema.json"
doc_title: "ADR-032: Support and Diagnostics Data Policy"
summary: "Defines what data can be collected for support/diagnostics, what must be excluded (secrets/PII), and the consent model for exporting diagnostic bundles."
created: "2025-12-15"
last_reviewed: "2026-02-12"
doc_category: "guide"
author: "Nick2bad4u"
tags:
 - "uptime-watcher"
 - "architecture"
 - "adr"
 - "support"
 - "diagnostics"
 - "privacy"
 - "logging"
 - "security"
---

# ADR-032: Support and Diagnostics Data Policy

## Status

✅ Accepted (policy defined; bundle tooling may evolve)

## Context

Uptime Watcher includes local logging and planned support tooling (diagnostics
bundle).

Support artifacts are useful for debugging issues, but they can also leak sensitive data if not constrained.

This ADR defines the “allowed data” boundary for any support export.

## Decision drivers

1. **Privacy**: do not leak secrets or personal data.
2. **User control**: diagnostics exports must be user-initiated.
3. **Support effectiveness**: include enough non-sensitive metadata to debug.

## Decision

### 0) Definitions: data classes

For this ADR, we classify data into three buckets:

- **Secrets (never allowed)**: tokens, passphrases, auth headers, OAuth
  authorization codes, derived encryption keys.
- **Personal / user-provided content (restricted)**: monitored URLs, site names,
  cloud account labels (often email addresses), local filesystem paths.
- **Operational diagnostics (generally allowed)**: app version, OS/runtime
  version, non-sensitive error codes, redacted stack traces.

### 1) User-initiated export only

Any “support bundle” export must:

- be initiated explicitly by the user
- show a clear summary of what will be included
- be written only to a user-selected location
- avoid retaining extra copies after export completes

The app must not upload diagnostics automatically.

Clarification:

- The app _does_ write local logs during normal operation.
- The restriction here is about exporting/transmitting a support bundle.

### 1.1) Default stance: minimal

The default export must be minimal and must not require the user to understand the entire data model.

### 2) Hard exclusions (must never be included)

Support artifacts must never include:

- OAuth access/refresh tokens
- authorization codes
- PKCE `code_verifier`
- encryption passphrases
- raw cookies

This includes secrets that may appear in:

- HTTP headers (e.g. `Authorization`)
- query strings
- JSON payloads

If a secret is detected, it must be redacted before writing to disk.

Implementation reality:

- The shared logging pipeline sanitizes log strings and structured metadata via
  `shared/utils/loggingContext.ts` (`normalizeLogValue`).
- Preload diagnostics previews apply an additional key-based redactor in
  `electron/preload/utils/preloadLogger.ts`.

### 3) Sensitive-but-useful data (requires explicit user acknowledgement)

Some data can be sensitive depending on the user environment:

- monitored site URLs
- headers or monitor configuration details

Policy:

- include these only when the user explicitly opts in
- provide an “exclude site URLs” option

Additional restricted data:

- Cloud provider account labels can be personally identifying (often email).
  These must be treated as restricted and should be excluded by default from
  any exported bundle unless the user opts in.

### 3.1) Example inclusion matrix

| Category                          | Default | User opt-in  | Notes                                                   |
| --------------------------------- | ------- | ------------ | ------------------------------------------------------- |
| App version / build info          | ✅       | n/a          | Safe and required                                       |
| OS + runtime info                 | ✅       | n/a          | Avoid unique hardware identifiers                       |
| Log excerpts (recent)             | ✅       | n/a          | Must be redacted                                        |
| Full logs                         | ❌       | ✅            | Can include sensitive context; redaction still required |
| Monitor list (URLs)               | ❌       | ✅            | Explicit acknowledgement required                       |
| Cloud provider status (no tokens) | ✅       | n/a          | Account labels must be masked or excluded by default    |
| Database file                     | ❌       | ✅ (advanced) | Must warn that it can contain sensitive URLs            |

### 4) Redaction policy

If logs are included:

- redact tokens and credentials using a denylist-based redactor
- avoid logging full request bodies for provider APIs

The redaction strategy must be layered:

1. **Structured redaction** for known fields (tokens, headers)
2. **Pattern-based redaction** for common token shapes

Redaction must be tested with unit tests using representative payload samples.

Implemented redaction rules (today):

- `normalizeLogValue()` redacts:
  - URL username/password
  - query params such as `access_token`, `refresh_token`, `code`, `state`,
    `passphrase`, etc.
  - Authorization header token material (`Bearer ...`, `Basic ...`)
  - structured metadata keys like `authorization`, `token`, `refresh_token`,
    `cookie`, `set-cookie`, etc.

- Structured logging context hashes `siteIdentifier` and `monitorId` so routine
  logs can correlate events without emitting raw identifiers.

### 5) Relationship to existing docs

- ADR-014 defines logging/telemetry/diagnostic principles.
- ADR-020 defines the proposed structure of a diagnostics bundle.

This ADR defines the data boundary that both must obey.

## Consequences

- **Pro**: support tooling can be expanded safely.
- **Pro**: clear privacy guarantees.
- **Con**: redaction logic must be maintained as new integrations are added.

## Implementation notes

### Local log retention and storage (implemented)

- Main process logging uses `electron-log` and writes to a local file with a
  maximum size cap.
  - Config: `electron/main.ts`
  - File name: `uptime-watcher-main.log`
  - Max size: 5 MiB (`LOG_FILE_MAX_SIZE`)

Retention model:

- Retention is currently **size-based** (bounded by log rotation behavior at
  the configured max size), not time-based.
- The app does not upload logs.

### Support bundle retention and cleanup (policy)

Even though the diagnostics bundle export feature is defined in ADR-020 and may
evolve, retention constraints are non-negotiable:

- Bundles are generated locally, staged in a temporary directory, and moved to
  the user-selected export destination.
- Temporary staging directories must be deleted on success and failure.
- The app must not keep a hidden/cache copy of exported bundles.

### Diagnostics IPC reports (implemented)

The preload bridge can report guard failures to the main process for debugging
bridge drift (this is not a user-exported support bundle):

- IPC handler: `electron/services/ipc/handlers/diagnosticsHandlers.ts`
- Payload preview and metadata are sanitized and size-limited.
  - Metadata cap: 2048 UTF-8 bytes
  - Payload preview cap: 4096 UTF-8 bytes

These reports are written to local logs only and are subject to the same local
retention model.

Even if the support bundle feature evolves (ADR-020), this data boundary is mandatory.

When adding a new integration (cloud provider, alert provider, etc.), update the redaction denylist and the bundle inclusion matrix.

## Related ADRs

- ADR-014: Logging, Telemetry, and Diagnostics
- ADR-020: Support Diagnostics Bundle
- ADR-023: Secret Storage and Encryption Policy
