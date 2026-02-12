---
schema: "../../../config/schemas/doc-frontmatter.schema.json"
doc_title: "ADR-019: Templates and Bulk Operations"
summary: "Defines portable, versioned templates for sites/monitors and bulk-edit/import workflows with validation and preview."
created: "2025-12-12"
last_reviewed: "2026-02-12"
doc_category: "guide"
author: "Nick2bad4u"
tags:
 - "uptime-watcher"
 - "architecture"
 - "adr"
 - "templates"
 - "import"
 - "export"
 - "bulk"
 - "validation"
---

# ADR-019: Templates and Bulk Operations

## Table of Contents

1. [Status](#status)
2. [Context](#context)
3. [Decision](#decision)
4. [Consequences](#consequences)
5. [Implementation](#implementation)
6. [Testing & Validation](#testing--validation)
7. [Related ADRs](#related-adrs)
8. [Review](#review)

## Status

Proposed

## Context

Users want faster workflows:

- bulk add/update monitors
- reusable monitor “templates” (e.g., HTTP + timeout + headers)
- import/export site configurations

We already support local backup/restore (ADR-013). Templates are a lighter-weight, human-editable portability mechanism.

## Decision

### 1) Versioned template format

- Templates are JSON.
- Include:
  - `templateSchemaVersion`
  - `appVersion`
  - `createdAt`
- Validate via shared Zod schemas.

### 2) Preview-first import

Imports must provide a preview:

- show which sites/monitors will be created/updated/deleted
- allow user to confirm

Implementation note (current import/export):

- JSON imports are parsed and validated in a pure step first
  (`DataImportExportService.importDataFromJson`) so the renderer can show a
  preview and validation errors without mutating local state.

### 3) Destructive operations must be explicit

There are two distinct user flows:

1. **JSON snapshot import/export** (implemented)

- Import is a **replace-all** operation.
- Persisting an import deletes the existing dataset (sites, monitors, history,
  settings) inside a single transaction, then inserts the imported dataset.
- The UI must present an explicit destructive confirmation.

2. **Templates + bulk edit** (planned)

- Template application and bulk edits must be non-destructive by default.
- Deletions are never implied by applying a template.
- Any destructive bulk change (delete monitors, delete sites) is an explicit,
  separately-confirmed operation.

### 4) Bulk operations are service-boundary validated

- Renderer UI calls a service.
- Main process validates payloads and executes operations.

### 5) Bulk execution model: atomic by default

Bulk operations that mutate multiple records must have explicit execution
semantics.

Default behavior:

- **Atomic** (all-or-nothing) via `DatabaseService.executeTransaction()`.
- Any failure aborts the operation and rolls back the transaction.

Optional behavior (only when explicitly selected by the user):

- **Best-effort** execution, where independent items can succeed even if other
  items fail.

When best-effort is enabled, the implementation must still preserve
consistency:

- Use a single top-level transaction.
- Wrap each item in a savepoint.
- On item failure, roll back to the item savepoint and continue.
- Commit once at the end.

This yields partial success while ensuring that each successful item is applied
atomically (and that a failed item does not leave partial writes).

### 6) Bulk error reporting: structured and renderer-safe

Bulk operations must return a structured result that supports:

- concise UI summaries
- detailed per-item failures
- safe, redacted error messages

Result shape (indicative):

- `success: boolean`
- `mode: "atomic" | "best-effort"`
- `appliedCount: number`
- `failedCount: number`
- `failures: Array<{ itemKey: string; code?: string; message: string }>`

Error messages must use the same redaction posture as user-facing errors and
logs (ADR-014): never echo secrets, OAuth tokens, or full URLs.

## Consequences

### Positive

- Big UX improvement for power users.
- Safer imports (preview + explicit confirmation).

### Negative

- Requires diffing and good UI presentation.

## Implementation

### Implemented today: JSON import/export

The application already supports a validated import/export flow for JSON
snapshots (distinct from SQLite backup/restore):

- Service: `electron/services/database/DataImportExportService.ts`
  - `exportAllData()` produces a bounded JSON snapshot.
  - `importDataFromJson()` parses + validates without side effects (preview
    step).
  - `persistImportedData()` performs a destructive replace-all inside a single
    transaction.
- IPC: `export-data` / `import-data` (validated, request/response IPC).

Notes:

- The import/export flow intentionally strips `cloud.*` settings keys to avoid
  transferring provider secrets or machine-specific sync state.

### Planned: reusable templates

Template support is not implemented yet.

When added, the recommended module layout is:

- `shared/types/templates/`
- `shared/validation/templates/`
- `electron/services/templates/` (pure template expansion + preview)
- `electron/services/database/` (bulk persistence using transaction adapters)

### Template variable expansion rules

Variable expansion must be deterministic and safe. We do not support arbitrary
expressions.

Placeholder syntax:

- Use the same placeholder form as `shared/utils/logTemplates.ts`:
  `{variableName}`

Variable name rules:

- Must match `[$_a-z][\w$]*` (case-insensitive).
- No dotted paths (for example, `{site.name}` is invalid).

Expansion rules:

- Expansion runs only on string fields inside template payloads.
- Unknown variables are left untouched (the placeholder remains in the
  output).
- Values are stringified only for primitives:
  - string is used as-is
  - number renders as decimal
  - boolean renders as `true`/`false`
  - other types are treated as missing

Safety rules:

- Enforce byte budgets for expanded strings (DoS protection).
- Do not read from environment variables.
- Do not allow `eval`-like constructs or function calls.

Validation after expansion:

- Expanded payloads must be validated with shared Zod schemas before any
  database write occurs.

## Testing & Validation

- Snapshot tests for diff/preview rendering.
- Property tests for round-trip import/export where possible.
- Unit tests for template expansion with:
  - missing variables
  - oversized expansions
  - invalid variable names
  - validation failures after expansion

## Related ADRs

- [ADR-013: Data Portability & Backup/Restore](./ADR_013_DATA_PORTABILITY_AND_BACKUP.md)
- [ADR-009: Validation Strategy](./ADR_009_VALIDATION_STRATEGY.md)
- [ADR-005: IPC Communication Protocol](./ADR_005_IPC_COMMUNICATION_PROTOCOL.md)
- [ADR-014: Logging, Telemetry, and Diagnostics](./ADR_014_LOGGING_TELEMETRY_AND_DIAGNOSTICS.md)

## Review

- Next review: 2026-03-01 or when shipping first bulk import.
