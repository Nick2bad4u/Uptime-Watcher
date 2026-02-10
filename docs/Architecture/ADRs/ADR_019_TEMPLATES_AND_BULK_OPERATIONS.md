---
schema: "../../../config/schemas/doc-frontmatter.schema.json"
doc_title: "ADR-019: Templates and Bulk Operations"
summary: "Defines portable, versioned templates for sites/monitors and bulk-edit/import workflows with validation and preview."
created: "2025-12-12"
last_reviewed: "2025-12-16"
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

### 3) No implicit destructive operations

- Deletions are never implied by import.
- “Replace existing” is an explicit option and must show a full diff.

### 4) Bulk operations are service-boundary validated

- Renderer UI calls a service.
- Main process validates payloads and executes operations.

## Consequences

### Positive

- Big UX improvement for power users.
- Safer imports (preview + explicit confirmation).

### Negative

- Requires diffing and good UI presentation.

## Implementation

- `shared/types/templates/`
- `shared/validation/templates/`
- `electron/services/templates/TemplateService`
- UI surfaces in Settings or Sites area

## Testing & Validation

- Snapshot tests for diff/preview rendering.
- Property tests for round-trip import/export where possible.

## Related ADRs

- [ADR-013: Data Portability & Backup/Restore](./ADR_013_DATA_PORTABILITY_AND_BACKUP.md)
- [ADR-009: Validation Strategy](./ADR_009_VALIDATION_STRATEGY.md)
- [ADR-005: IPC Communication Protocol](./ADR_005_IPC_COMMUNICATION_PROTOCOL.md)

## Review

- Next review: 2026-03-01 or when shipping first bulk import.
