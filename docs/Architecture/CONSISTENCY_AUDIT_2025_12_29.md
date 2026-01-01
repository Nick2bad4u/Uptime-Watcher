---
schema: "../../config/schemas/doc-frontmatter.schema.json"
title: "Consistency Audit — 2025-12-29"
summary: "Consistency audit covering Electron layering, shared validation contracts, and Settings UI standardization."
created: "2025-12-29"
last_reviewed: "2025-12-29"
category: "guide"
author: "GitHub Copilot"
tags:
 - "architecture"
 - "consistency"
 - "electron"
 - "database"
 - "validation"
 - "settings"
---

# Consistency Audit — 2025-12-29

## Scope

Implementation-layer audit focused on:

- Electron main-process layering (repositories ↔ services ↔ IPC handlers)
- Shared contracts (types + Zod validation)
- Renderer Settings UI patterns (layout + components)

Tests/Playwright/Storybook are out of scope **except** where they reveal contract mismatches.

## Summary of work completed during this refactor

These were high-impact alignment fixes already applied and verified via `lint:all:fix`, `type-check:all`, and full `test`:

- **Database orchestration modules moved** from `electron/utils/database/*` → `electron/services/database/*` to match repository/service layering.
- **Canonical import/export validation** introduced in `shared/validation/importExportSchemas.ts` and adopted by `electron/services/database/DataImportExportService.ts`.
- **Settings UI standardization** (subcards + accents + Notifications 2-col layout) implemented in `src/components/Settings/Settings.css` and related components.

## Findings (categorized + prioritized)

### A) Structural alignment

#### A1 (P1, resolved) Repository export naming clarified

**Files**:

- `electron/services/database/SiteRepository.ts`
- `electron/services/database/DataImportExportService.ts`

**Excerpt** (`SiteRepository.exportAllRows()` returns _rows_, not full domain sites):

```ts
// electron/services/database/SiteRepository.ts
public async exportAllRows(): Promise<SiteRow[]> {
  // ...
}
```

**Outcome**:
The repository method was renamed to `exportAllRows()` to make it explicit that it returns `SiteRow[]` (rows, not hydrated domain sites).

**Remaining recommendation**:
If a future flow needs “exportable domain objects”, prefer adding an explicit service-level method that returns `Site[]` and uses repositories to hydrate monitors/history.

---

#### A2 (P2) “utils” under `services/database/` is fine, but needs clearer intent

**Files**:

- `electron/services/database/utils/*`

**Issue**:
The repo now contains both:

- `electron/utils/*` (cross-cutting infrastructure)
- `electron/services/database/utils/*` (database-layer helpers)

That is OK, but the naming can be confusing: “utils” can mean “low-level helpers” or “misc dumping ground”.

**Recommendation**:

- Keep `services/database/utils/*`, but consider subfolders like `services/database/repositories/utils/*` vs `services/database/validation/*` to make intent explicit.

---

### B) Data flow health (persistence → IPC → renderer)

#### B1 (P0, resolved) Import/export now use `DataImportExportError`

**Outcome**:
`DataImportExportService` now throws `DataImportExportError` for import/export operations, removing the misleading
“Failed to load sites” prefix from these error paths.

---

#### B2 (P1) Parse-any JSON then validate (good), but document it

**Files**:

- `electron/services/database/DataImportExportService.ts`
- `shared/validation/importExportSchemas.ts`

**Excerpt**:

```ts
const parseResult = safeJsonParse<JsonValue>(jsonData, acceptAnyJsonValue);
const validation = validateImportData(parseResult.data);
```

**Issue**:
The project historically used “type guards during parse” in some places. The import/export flow now does the correct thing:

1. parse JSON permissively
2. validate strictly via shared Zod schema

This is an architectural improvement, but it should be a documented convention so other modules don’t reintroduce ad-hoc parsing.

**Recommendation**:

- Add a short doc note under `docs/Architecture/` or `docs/Guides/` describing boundary validation strategy:
  - parse JSON to `JsonValue`
  - validate with shared Zod
  - emit typed errors via event bus

---

### C) Logic uniformity

#### C1 (P1) Interval/timeout units remain a high-risk area

**Files (representative)**:

- `shared/constants/monitoring.ts`
- `src/components/SiteDetails/tabs/SettingsTab.tsx`

**Issue**:
The codebase uses:

- millisecond storage for `checkInterval` and `timeout` in core types
- some UI affordances in seconds

The conversion utilities exist, but the risk is recurring “seconds vs ms” drift.

**Recommendation**:

- Standardize _storage_ as milliseconds everywhere (already true for `Monitor.checkInterval` and `Monitor.timeout`).
- Require UI components to explicitly name units in variable names (`timeoutSeconds`, `timeoutMs`).
- Prefer shared conversion helpers rather than ad-hoc math in components.

---

### D) Interface cohesion

#### D1 (P0 resolved) Import/export schemas are now shared + canonical

**Files**:

- `shared/validation/importExportSchemas.ts`

**Why it matters**:
This reduces divergence between Electron and renderer, and makes IPC/data-layer boundaries enforce consistent shape.

**Remaining follow-up**:

- Ensure any legacy ad-hoc import/export validators are deleted (none found in current search).

---

### E) UI consistency (Settings)

#### E1 (P2) `SettingItem` now supports `IconType` and render-callback controls

**Files**:

- `src/components/shared/SettingItem.tsx`

**Excerpt**:

```tsx
readonly control: (() => ReactNode) | ReactNode;
readonly iconComponent?: IconType;
```

**Issue**:
This is a pragmatic response to strict perf lint (`jsx-no-jsx-as-prop`). It works, but it introduces a second calling convention for controls.

**Recommendation**:

- Document this as the preferred Settings-row pattern.
- Consider extracting a small `SettingsRowIcon` helper to standardize sizing + color classes.

---

#### E2 (P2 resolved) Notifications grid is now stable 2-column

**Files**:

- `src/components/Settings/Settings.css`

**Excerpt**:

```css
.settings-notifications-grid {
 grid-template-columns: repeat(2, minmax(0, 1fr));
}
```

**Why it matters**:
This prevents “auto-fit” layouts from drifting into 1 or 3 columns at different widths, keeping the left/right grouping stable.

## Roadmap

### Quick wins (1–3 PRs)

- Create `DataImportExportError` and stop throwing `SiteLoadingError` for import/export. (resolved)
- Rename `SiteRepository.exportAll()` to `exportAllRows()` so it reflects that it returns rows. (resolved)
- Add docs page: “Boundary validation strategy (JsonValue → Zod → typed events)”. (resolved)

### Medium-term (coordinated refactors)

- Standardize unit naming for timeouts/intervals across renderer + electron modules (seconds UI, ms storage).
- Review `electron/services/**/utils` folders and rename/cluster where needed.

### Long-term (architecture)

- Formalize a “read model builder” service for exports and any future sync/backup flows (so repositories stay row-focused).
- Consider a shared error taxonomy for database operations (import/export/backup/restore) so IPC/UI can render consistent UX.

---

## Appendix: Representative flow notes

- **Export flow**: IPC (`DATA_CHANNELS.exportData`) → orchestrator → `DataImportExportService.exportAllData()` → repositories → JSON stringify.
- **Import flow**: IPC (`DATA_CHANNELS.importData`) → orchestrator → `importDataFromJson()` (parse `JsonValue`) → `validateImportData()` (Zod) → `persistImportedData()` (transaction adapters).
