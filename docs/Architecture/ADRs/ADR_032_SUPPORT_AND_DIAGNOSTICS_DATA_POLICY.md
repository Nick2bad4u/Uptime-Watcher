---
schema: "../../../config/schemas/doc-frontmatter.schema.json"
title: "ADR-032: Support and Diagnostics Data Policy"
summary: "Defines what data can be collected for support/diagnostics, what must be excluded (secrets/PII), and the consent model for exporting diagnostic bundles."
created: "2025-12-15"
last_reviewed: "2025-12-15"
category: "guide"
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

Uptime Watcher includes local logging and planned support tooling (diagnostics bundle).

Support artifacts are useful for debugging issues, but they can also leak sensitive data if not constrained.

This ADR defines the “allowed data” boundary for any support export.

## Decision drivers

1. **Privacy**: do not leak secrets or personal data.
2. **User control**: diagnostics exports must be user-initiated.
3. **Support effectiveness**: include enough non-sensitive metadata to debug.

## Decision

### 1) User-initiated export only

Any “support bundle” export must:

- be initiated explicitly by the user
- show a clear summary of what will be included

The app must not upload diagnostics automatically.

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

### 3) Sensitive-but-useful data (requires explicit user acknowledgement)

Some data can be sensitive depending on the user environment:

- monitored site URLs
- headers or monitor configuration details

Policy:

- include these only when the user explicitly opts in
- provide an “exclude site URLs” option

### 3.1) Example inclusion matrix

| Category                          | Default | User opt-in  | Notes                                                   |
| --------------------------------- | ------- | ------------ | ------------------------------------------------------- |
| App version / build info          | ✅       | n/a          | Safe and required                                       |
| OS + runtime info                 | ✅       | n/a          | Avoid unique hardware identifiers                       |
| Log excerpts (recent)             | ✅       | n/a          | Must be redacted                                        |
| Full logs                         | ❌       | ✅            | Can include sensitive context; redaction still required |
| Monitor list (URLs)               | ❌       | ✅            | Explicit acknowledgement required                       |
| Cloud provider status (no tokens) | ✅       | n/a          | Account labels allowed                                  |
| Database file                     | ❌       | ✅ (advanced) | Must warn that it can contain sensitive URLs            |

### 4) Redaction policy

If logs are included:

- redact tokens and credentials using a denylist-based redactor
- avoid logging full request bodies for provider APIs

The redaction strategy must be layered:

1. **Structured redaction** for known fields (tokens, headers)
2. **Pattern-based redaction** for common token shapes

Redaction must be tested with unit tests using representative payload samples.

### 5) Relationship to existing docs

- ADR-014 defines logging/telemetry/diagnostic principles.
- ADR-020 defines the proposed structure of a diagnostics bundle.

This ADR defines the data boundary that both must obey.

## Consequences

- **Pro**: support tooling can be expanded safely.
- **Pro**: clear privacy guarantees.
- **Con**: redaction logic must be maintained as new integrations are added.

## Implementation notes

Even if the support bundle feature evolves (ADR-020), this data boundary is mandatory.

When adding a new integration (cloud provider, alert provider, etc.), update the redaction denylist and the bundle inclusion matrix.

## Related ADRs

- ADR-014: Logging, Telemetry, and Diagnostics
- ADR-020: Support Diagnostics Bundle
- ADR-023: Secret Storage and Encryption Policy
