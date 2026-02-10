---
schema: "../../../config/schemas/doc-frontmatter.schema.json"
doc_title: "Boundary Validation Strategy"
summary: "Standard pattern for parsing, validating, and transporting untrusted data across IPC and persistence boundaries."
created: "2025-12-29"
last_reviewed: "2025-12-30"
doc_category: "guide"
author: "GitHub Copilot"
tags:
  - "architecture"
  - "validation"
  - "zod"
  - "ipc"
  - "electron"
  - "renderer"
---
# Boundary Validation Strategy

## Intent

Uptime Watcher treats any data crossing a _trust boundary_ as untrusted until it has been validated.

A boundary is any transition where we cannot rely on TypeScript types alone, including:

- Renderer → main process IPC requests
- Main process → renderer IPC responses
- File imports (JSON import/export)
- Database reads (rows → domain objects)
- Network payloads (HTTP responses)

This document defines the canonical strategy for:

1. Parsing safely
2. Validating with shared Zod schemas
3. Emitting/returning typed results with consistent error and diagnostics behavior

## Why this strategy exists

- **TypeScript types do not exist at runtime**. Any runtime input can violate compile-time contracts.
- Centralizing contracts under `shared/validation/*` prevents drift between renderer and Electron.
- We want **symmetry**: validate on both sides of IPC to avoid trusting the other process.

See also:

- `docs/Architecture/ADRs/ADR_009_VALIDATION_STRATEGY.md`
- `docs/Architecture/ADRs/ADR_005_IPC_COMMUNICATION_PROTOCOL.md`

## Canonical pattern

### Step 1: Parse into a safe intermediate type

When parsing JSON from disk or user input, parse into `JsonValue` (or `unknown`) first.

- Do **not** parse directly into domain types.
- Do **not** rely on ad-hoc type guards for structural correctness.

Example (main process import flow):

```ts
import type { JsonValue } from "type-fest";

import { safeJsonParse } from "@shared/utils/jsonSafety";

const parseResult = safeJsonParse<JsonValue>(
 jsonString,
 (value): value is JsonValue => value !== undefined
);
```

### Step 2: Validate with a shared Zod schema

Validate the parsed `JsonValue` using a schema from `@shared/validation/*`.

Example (import/export):

```ts
import { validateImportData } from "@shared/validation/importExportSchemas";

const validation = validateImportData(parseResult.data);
if (validation.ok === false) {
 throw new Error(
  `${validation.error.message}: ${validation.error.issues.join("; ")}`
 );
}
```

Guidelines:

- Prefer `.safeParse()` and return structured failures (issues list + message).
- Prefer `formatZodIssues`-style helpers when presenting issues.
- Keep schemas **strict** at boundaries (`.strict()`) unless there is a deliberate compatibility need.

### Step 3: Transform at layer boundaries (rows ↔ domain)

Repositories should deal in persistence shapes (rows) and apply mapping functions (row → domain) at explicit boundaries.

Examples:

- `electron/services/database/utils/siteMapper.ts` maps database rows to domain `Site`.
- Import/export builds exportable domain graphs by combining:
  - `SiteRow` (sites)
  - `MonitorRow`/monitor domain records
  - status history rows

Guidelines:

- Avoid mixing persistence shapes (rows) with renderer-facing domain objects.
- Name methods so their output shape is explicit (e.g. `exportAllRows()` vs `getSitesFromDatabase()`).

### Step 4: Emit typed diagnostics/events

When a boundary validation fails:

- Log with structured context (operation name + relevant identifiers).
- Emit typed events (`TypedEventBus`) from main process services when appropriate.
- Surface renderer-visible errors via IPC responses or dedicated error channels.

Example (database error emission):

```ts
await eventEmitter.emitTyped("database:error", {
 details: message,
 error: toSerializedError(normalizedError),
 operation,
 timestamp: Date.now(),
});
```

## Strict vs best-effort parsing

Not every boundary uses the same failure semantics.

### Strict parsing (fail-fast)

Use strict parsing when the caller _must_ have the data to proceed safely.

Examples:

- Downloading a specific cloud backup metadata sidecar for restore
  (`parseCloudBackupMetadataFileBuffer` throws on invalid JSON)
- Import flows where the user expects an error explaining why their file
  cannot be imported

### Best-effort parsing (skip/repair)

Use best-effort parsing when failure should not block showing other valid
items.

Examples:

- Listing multiple cloud backup metadata files where a single corrupt metadata file
  should not hide other backups (`tryParseCloudBackupMetadataFileBuffer`)
- Cloud sync manifest parsing where corruption is treated as "missing" and the
  system rebuilds remote state from operation logs

### Typed corruption errors

When parsing failures indicate **corruption or incompatible remote state**
(rather than transient network/provider failures), prefer throwing a typed
error (e.g. a `*Corrupt*` error) so callers can implement consistent recovery
behaviour.

Example:

- Cloud sync snapshot/operations objects throw a typed corruption error when
  they exist but are invalid (size limit exceeded, invalid JSON, schema
  mismatch). The sync engine can then reliably decide whether to rebuild state
  from operation logs or surface an error.

Guideline: **best-effort parsing must be observable** (log a warning with
structured context), and strict parsing should produce a user-facing error.

## Common pitfalls to avoid

- **Using `any`** to bypass validation errors.
- Validating only on one side of IPC.
- Returning partial domain objects with missing invariants (e.g., `Site` without `monitors`).
- Encoding units implicitly (seconds vs milliseconds). Prefer explicit naming.

## Quick checklist

Before shipping a new boundary:

- [ ] Parse with a safe helper (`safeJsonParse`, network parsing helper, etc.)
- [ ] Validate with a schema from `shared/validation/*`
- [ ] Keep transformations explicit (rows ↔ domain)
- [ ] Emit typed diagnostics/events on failure
- [ ] Add tests for invalid payloads and schema drift
