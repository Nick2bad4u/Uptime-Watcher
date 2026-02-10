---
schema: "../../config/schemas/doc-frontmatter.schema.json"
doc_title: "New Monitor Type Implementation Guide"
summary: "End-to-end guide for implementing a new monitor type in the Uptime Monitoring System."
created: "2025-08-01"
last_reviewed: "2026-02-01"
doc_category: "guide"
author: "Nick2bad4u"
tags:
 - "uptime-watcher"
 - "monitoring"
 - "monitor-types"
 - "implementation"
 - "guide"
---

# Uptime Monitoring System - New Monitor Type Implementation Guide

## Table of Contents

1. [1. Who Should Use This Guide](#1-who-should-use-this-guide)
2. [2. End-to-End Flyover](#2-end-to-end-flyover)
3. [3. Architecture Recap](#3-architecture-recap)
4. [4. File Impact Matrix](#4-file-impact-matrix)
5. [5. Step-by-Step Implementation](#5-step-by-step-implementation)
6. [6. Troubleshooting and FAQ](#6-troubleshooting-and-faq)
7. [7. Appendix - Reference Snippets](#7-appendix---reference-snippets)
8. [8. Change Log for This Guide](#8-change-log-for-this-guide)

## 1. Who Should Use This Guide

- Primary audience: product and platform engineers adding first-party monitors (HTTP variants, DNS, TCP, certificate checks, etc.).
- Secondary audience: QA, SRE, and technical writers validating that a monitor was wired end-to-end.
- Prerequisites: working knowledge of TypeScript, Node.js, React, Zustand, and basic Electron concepts. Familiarity with SQLite and Zod helps but is not required; relevant snippets appear below.

---

## 2. End-to-End Flyover

1. Model the type - decide on the monitor identifier and configuration fields.
2. Extend shared contracts - update shared types, Zod schemas, validation helpers, and defaults.
3. Implement backend logic - build the monitoring service, register it, and make sure persistence paths understand the new metadata.
4. Wire the renderer - teach the stores, forms, validation utilities, and display components how to collect and render the configuration.
5. Test and release - cover the new monitor in unit, integration, fuzz, and end-to-end tests; update docs and deployment artifacts.

Each phase below lists the concrete files that must be touched. Work through them in order; skipping a phase will surface runtime errors because every layer depends on shared metadata.

---

## 3. Architecture Recap

```text
Shared Domain (TypeScript + Zod)
  - shared/types.ts
  - shared/types/monitorConfig.ts
  - shared/validation/schemas.ts
  - shared/utils/validation.ts

Electron Backend (monitor services, registry, persistence)
  - electron/services/monitoring/**/*
  - electron/services/database/**/*

Renderer (React + Zustand)
  - src/stores/**/*
  - src/components/**/*
  - src/utils/**/*
```

---

## 4. File Impact Matrix

- **Shared** (Declare monitor type, config, validation)
  - Responsibility: Declare monitor type, config, validation
  - Touch These Files: `shared/types.ts`<br>`shared/types/monitorConfig.ts`<br>`shared/types/monitorTypes.ts`<br>`shared/types/schemaTypes.ts`<br>`shared/validation/schemas.ts`<br>`shared/utils/validation.ts`<br>`shared/utils/logTemplates.ts` (if new log codes)<br>`shared/test/validation/schemas.comprehensive.test.ts`<br>`shared/test/types.fast-check-comprehensive.test.ts` (and any other tests that assert the contents of `BASE_MONITOR_TYPES`)
  - Notes: Update unions, defaults, schemas, and add tests for both happy and error paths.
- **Electron backend** (Service logic, registry metadata, retry policies)
  - Responsibility: Service logic, registry metadata, retry policies
  - Touch These Files: `electron/services/monitoring/<NewMonitor>.ts`<br>`electron/services/monitoring/MonitorTypeRegistry.ts`<br>`electron/services/monitoring/EnhancedMonitorChecker.ts`<br>`electron/services/monitoring/types.ts`<br>`electron/services/monitoring/shared/monitorServiceHelpers.ts`<br>`electron/test/services/monitoring/*`<br>`electron/test/fuzzing/*`
  - Notes: Ensure the service is routed, participates in retries, emits structured logs, and carries a version.
- **Persistence** (Persist dynamic fields and history)
  - Responsibility: Persist dynamic fields and history
  - Touch These Files: `electron/services/database/utils/dynamicSchema.ts`<br>`electron/services/database/utils/monitorMapper.ts`<br>`electron/services/database/MonitorRepository.ts`<br>`shared/types/database.ts`<br>`electron/test/fuzzing/databaseSchema.*.test.ts`
  - Notes: Confirm dynamic columns map to snake\_case SQL fields, round-trip correctly, and keep TypeScript facades/mappers in sync.
- **Renderer** (Collect config, validate, display)
  - Responsibility: Collect config, validate, display
  - Touch These Files: `src/types/monitorFormData.ts`<br>`src/utils/monitorValidation.ts`<br>`src/stores/sites/utils/monitorOperations.ts`<br>`src/stores/monitor/useMonitorTypesStore.ts`<br>`src/components/SiteDetails/useAddSiteForm.ts`<br>`src/components/AddSiteForm/AddSiteForm.tsx`<br>`src/components/AddSiteForm/DynamicMonitorFields.tsx`<br>`src/components/AddSiteForm/Submit.tsx`<br>`src/components/Dashboard/SiteCard/components/MonitorSelector.tsx`<br>`src/components/SiteDetails/MonitoringStatusDisplay.tsx`<br>`src/utils/monitorTitleFormatters.ts`<br>`src/test/branch-coverage-optimization.test.tsx`<br>`src/constants.ts`<br>`src/utils/fallbacks.ts`<br>`src/test/constants.test.ts`<br>`src/test/constants-theme-100-coverage.test.ts`<br>`src/test/*` (renderer suites and fuzzers)
  - Notes: Keep client defaults, validation, and UI fallbacks aligned with shared schemas and registry metadata.

Use this list as a printable checklist before opening a pull request.

---

## 5. Step-by-Step Implementation

### Step 0 - Specify the Monitor

1. Pick a lowercase identifier (hyphen separated when necessary). Document it in your design doc.
2. List every input field: name, type, min, max, default, and whether it is required.
3. Capture protocol dependencies (TLS, ICMP, DNS, authentication) and security considerations.
4. Decide how the monitor transitions between up, degraded, and down so that tests can assert the behaviour.

Deliverable: a short spec that includes `type`, `required fields`, `optional fields`, and `status mapping`.

---

### Step 1 - Extend Shared Domain Contracts

All shared types live under `shared/`. Updating them first unlocks both backend and renderer layers.

1. Declare the monitor type and fields
   - Append the identifier to `BASE_MONITOR_TYPES` in `shared/types.ts`.
   - Add optional properties to the `Monitor` interface for new fields (for example `latencyWarningMs`).
2. Update configuration contracts
   - In `shared/types/monitorConfig.ts` add an interface such as `NewMonitorConfig` extending `BaseMonitorConfig`.
   - Extend the `MonitorConfig` union and add a type guard `isNewMonitorConfig`.
   - Provide defaults in `DEFAULT_MONITOR_CONFIG["<type>"]` that respect system-wide retry and timeout conventions.
3. Review shared monitor metadata interfaces in `shared/types/monitorTypes.ts`; they already model extensible fields, so you typically only touch this file when introducing brand-new shared flags.
4. Add Zod schemas
   - Define `newMonitorSchema` in `shared/validation/schemas.ts` and include it in the discriminated union `monitorSchema`. Reference the schema via bracket notation (for example, `monitorSchemas["new-monitor"]`) when wiring it into registries.
   - Export a typed alias in `shared/types/schemaTypes.ts` for IDE support and cross-package imports.
5. Field-level validation
   - Add a dedicated validator in `shared/utils/validation.ts` so error messages remain human readable. The shared `validateMonitorType` helper already tracks `BASE_MONITOR_TYPES`, so you only need to plug in your type-specific logic.
6. Shared tests
   - Extend `shared/test/validation/schemas.comprehensive.test.ts` with happy and failure cases covering the new schema.
   - Update `shared/test/types.fast-check-comprehensive.test.ts` (and any other tests that hard-code `BASE_MONITOR_TYPES`) so the new identifier participates in the assertions and property-based generators.

Run the shared unit tests before moving on: `npm run test:shared`.

---

### Step 2 - Implement and Register the Backend Service

1. Create the service class
   - Add `electron/services/monitoring/<NewMonitor>.ts` implementing `IMonitorService` from `electron/services/monitoring/types.ts`.
   - Reuse helpers like `validateMonitorHostAndPort` and `createMonitorConfig` from `electron/services/monitoring/shared/monitorServiceHelpers.ts`, and wrap retries with `withOperationalHooks` from `electron/utils/operationalHooks.ts` to match shared behaviour. When you do, pick an explicit `failureLogLevel` that reflects whether failures are expected to represent external downtime (`warn` is usually right) or internal faults (keep the default `error`).
2. Write unit tests
   - Mirror `electron/test/services/monitoring/SslMonitor.test.ts`. Cover success, degraded thresholds, failure states, timeouts, and invalid configurations.
3. Register the monitor type
   - Update `electron/services/monitoring/MonitorTypeRegistry.ts`:
   - Import the service and call `registerMonitorType({ ... })` with description, display name, `fields` metadata, `serviceFactory`, `uiConfig`, and `validationSchema` (the shared schema you added).
   - Set the implementation version through `versionManager.setVersion(type, semver)` in the version block near the end of `MonitorTypeRegistry.ts` so telemetry and migrations stay aligned.
   - Provide history and analytics formatters as needed through the `uiConfig` hooks.
4. Route checks
   - In `electron/services/monitoring/EnhancedMonitorChecker.ts`, add a class property for the new service and handle it inside the `switch (monitor.type)` block.
5. IPC exports
   - The preload bridge already exposes registry functionality. If you create new IPC endpoints, update the preload module to forward them safely.
6. Logging templates
   - Add new log codes to `@shared/utils/logTemplates.ts` when you introduce monitor-specific logging.

Deliverable: service tests green, TypeScript build clean, and the monitor type appears in the registry at runtime.

---

### Step 3 - Guarantee Persistence and Data Pipelines

Dynamic schema generation means most database updates are metadata driven, but you must confirm the new fields flow end-to-end.

1. Dynamic schema definitions
   - `generateDatabaseFieldDefinitions` in `electron/services/database/utils/dynamicSchema.ts` reads registry field metadata. Verify your field descriptors (name, type) map to the correct SQL type (INTEGER, TEXT, etc.).
   - You do not manually edit `shared/types/database.ts`; monitor-specific columns are generated from the registry metadata. Confirm your field descriptor shows up when you inspect `generateDatabaseFieldDefinitions` output.

2. Row to object mapping
   - `mapMonitorToRow` and `mapRowToMonitor` iterate over registry field definitions. Confirm the new fields appear in both directions and update tests if you need custom conversion logic.
   - Adjust `electron/services/database/utils/monitorMapper.ts` tests when defaults or conversions change.
   - Update `electron/services/database/utils/monitorMapper.ts` so row->monitor conversions include the new fields.

3. Repository operations
   - `MonitorRepository.createInternal` and `bulkCreate` rely on generated SQL. Run repository tests or add new ones if the monitor requires special handling (for example, cascading history writes).

4. Database schema tests
   - Update fuzz suites in `electron/test/fuzzing/databaseSchema.*.test.ts` so they include the new monitor fields. Failures here usually point to naming or type mismatches.

Verification tip: start the Electron app after registering the monitor. The database bootstrap (`createDatabaseTables`) will throw immediately if metadata produces invalid SQL.

---

### Step 4 - Wire Up the Renderer

0. Frontend metadata helpers
   - Verify `src/utils/monitorTypeHelper.ts`, `src/utils/monitorUiHelpers.ts`, and `src/hooks/useMonitorTypes.ts` cache the new type, and update mocks/tests that export monitor types (including Storybook setup). Make sure to refresh `src/test/hooks/useMonitorTypes.test.ts`, which asserts the fallback options list.

1. Monitor types store
   - `useMonitorTypesStore` in `src/stores/monitor/useMonitorTypesStore.ts` consumes backend metadata. Update tests if they assert the list of known types.

2. Form data shapes
   - Extend `src/types/monitorFormData.ts` with interfaces, type guards, and default factories for the new type.
   - Ensure `createDefaultFormData` returns sensible defaults that match the shared defaults.

3. Client-side validation
   - In `src/utils/monitorValidation.ts`, add field-level validation and wire the new type into `validateMonitorFormDataByType`. Match error messages to the shared schema whenever possible.

4. Monitor normalization
   - Update `src/stores/sites/utils/monitorOperations.ts` so `filterMonitorFieldsByType`, type-specific default appliers, and `normalizeMonitor` understand the new fields.

5. Form state management
   - Extend `src/components/SiteDetails/useAddSiteForm.ts` to initialise state, reset values, and expose setters for the new fields.
   - Update `src/components/AddSiteForm/AddSiteForm.tsx`, `DynamicMonitorFields.tsx`, and `Submit.tsx` so inputs render and submissions convert string fields into typed values. Extend the `monitorValidationBuilders` map in `Submit.tsx` so the new type serialises correctly before IPC calls.

6. Fallback options and UI polish
   - Add the human-friendly label to `FALLBACK_MONITOR_TYPE_OPTIONS` in `src/constants.ts`.
   - Extend the label/identifier helpers in `src/utils/fallbacks.ts` (for example, the `MONITOR_TYPE_LABELS` and `MONITOR_IDENTIFIER_GENERATORS` maps) and any UI that renders them, such as `src/components/Dashboard/SiteCard/components/MonitorSelector.tsx`.
   - Keep the history/title fallbacks in sync by updating `src/utils/monitorTitleFormatters.ts`, `src/components/SiteDetails/MonitoringStatusDisplay.tsx`, and the coverage safety net in `src/test/branch-coverage-optimization.test.tsx` so the new type renders readable suffixes and connection details.

7. Renderer tests
   - Expand `src/test/hooks/useAddSiteForm.comprehensive.test.ts` to cover state transitions, resetting, and submission success.
   - Update regression and fuzz suites: `src/test/comprehensive-100-percent-coverage.test.tsx`, `src/test/fuzzing/monitor-operations.fuzz.test.ts`, and `src/test/stores/sites/utils/monitorOperations.fast-check-comprehensive.test.ts`.
   - Extend constants-focused suites (`src/test/constants.test.ts`, `src/test/constants-theme-100-coverage.test.ts`) and any AddSiteForm test doubles that hard-code `FALLBACK_MONITOR_TYPE_OPTIONS` so they include the new label/value pair.
   - Update shared and renderer form-data suites (`shared/test/types/formData.comprehensive.test.ts`, `src/test/types/monitorFormData.comprehensive.test.ts`, and their 100% coverage variants) so the new type participates in every assertion.

Goal: a user can add the monitor through the UI, validation responds correctly, and labels render without custom components.

---

### Step 5 - Validation, Testing, and Tooling

Run these commands after finishing code changes:

1. `npm run lint:fix`
2. `npm run type-check:all`
3. `npm run test:shared`
4. `npm run test:electron`
5. `npm run test:frontend`
6. `npm run fuzz`
7. Optional manual run: launch the Electron app, add the monitor, and tail logs to confirm details.

Capture any additional scripts, environment variables, or fixtures required to exercise the monitor so QA can automate scenarios.

---

### Step 6 - Deployment and Release Checklist

- \[ ] All automated tests above pass locally and in CI.
- \[ ] Updated user docs, runbooks, and screenshots if the UI changed.
- \[ ] Updated `CHANGELOG.md` and release notes with the new monitor capability.
- \[ ] Completed security or privacy review if the monitor touches new protocols or credentials.
- \[ ] Verified dynamic schema output against staging or production snapshots when possible.
- \[ ] Finalized rollout plan (feature flag, staged release, or full launch).

Once merged, monitor the first production checks closely. Add telemetry if the monitor depends on upstream services whose outages you want to isolate.

---

## 6. Troubleshooting and FAQ

- **Monitor type missing from dropdowns**
  - Likely Cause: `registerMonitorType` not called, or the renderer fell back to static options
  - Fix: Verify the registry entry in `electron/services/monitoring/MonitorTypeRegistry.ts` and check Electron main-process logs for import failures.
- **Validation errors differ between backend and frontend**
  - Likely Cause: Shared schema updates were skipped or client-side validation diverged
  - Fix: Align `shared/validation/schemas.ts` with `src/utils/monitorValidation.ts` and extend shared plus renderer tests to cover the new rules.
- **Database errors on startup**
  - Likely Cause: Field metadata does not map cleanly to SQL column types
  - Fix: Inspect `generateDatabaseFieldDefinitions` output and ensure each field maps to the intended SQL type in SQLite.
- **Monitor never runs in production**
  - Likely Cause: `EnhancedMonitorChecker` missing a case or the service throws before returning
  - Fix: Add the new type to the switch in `EnhancedMonitorChecker`, review logs for `[EnhancedMonitorChecker]` warnings, and extend backend unit tests.
- **UI renders blank fields**
  - Likely Cause: `DynamicMonitorFields` never received metadata for the new type
  - Fix: Confirm registry `fields` metadata is complete and that `useMonitorTypesStore` loads successfully (no IPC errors in the console).

---

## 7. Appendix - Reference Snippets

### Registry entry template (`electron/services/monitoring/MonitorTypeRegistry.ts`)

```typescript
registerMonitorType({
 description: "Explain what this monitor checks",
 displayName: "Human Name",
 fields: [
  {
   label: "Host",
   name: "host",
   type: "text",
   required: true,
   placeholder: "example.com",
   helpText: "Where should we connect?",
  },
  // Add more fields here
 ],
 serviceFactory: () => new NewMonitor(),
 type: "new-monitor",
 uiConfig: {
  detailFormats: {
   analyticsLabel: "New Monitor Response Time",
   historyDetail: (details) => `Details: ${details}`,
  },
  display: {
   showAdvancedMetrics: true,
   showUrl: false,
  },
  formatDetail: (details) => `Details: ${details}`,
  formatTitleSuffix: (monitor) => (monitor.host ? ` (${monitor.host})` : ""),
  supportsResponseTime: true,
 },
 validationSchema: monitorSchemas["new-monitor"],
 version: "1.0.0",
});
```

### Service skeleton (`electron/services/monitoring/NewMonitor.ts`)

```typescript
export class NewMonitor implements IMonitorService {
 public constructor(private config: MonitorConfig = {}) {}

 public getType(): MonitorType {
  return "new-monitor";
 }

 public updateConfig(config: Partial<MonitorConfig>): void {
  this.config = { ...this.config, ...config };
 }

 public async check(
  monitor: Site["monitors"][0],
  signal?: AbortSignal
 ): Promise<MonitorCheckResult> {
  if (monitor.type !== "new-monitor") {
   throw new Error(`NewMonitor cannot handle type: ${monitor.type}`);
  }

  const validationError = validateMonitorHostAndPort(monitor);
  if (validationError) {
   return createMonitorErrorResult(validationError, 0);
  }

  const { retryAttempts, timeout } = createMonitorConfig(monitor, {
   timeout: this.config.timeout,
  });

  return withOperationalHooks(
   () => this.performCheckOnce(monitor, timeout, signal),
   {
    maxRetries: retryAttempts + 1,
    operationName: `New monitor check for ${monitor.host}`,
   }
  );
 }

 private async performCheckOnce(
  monitor: Site["monitors"][0],
  timeout: number,
  signal?: AbortSignal
 ): Promise<MonitorCheckResult> {
  const started = performance.now();
  // TODO: Implement protocol-specific logic
  return {
   details: "Example details",
   responseTime: performance.now() - started,
   status: "up",
  };
 }
}
```

Replace the TODO block with real protocol logic. Keep exception handling defensive: return `createMonitorErrorResult` rather than throwing unless configuration is invalid.

---

## 8. Change Log for This Guide

- September 30, 2025 - Clarified shared-schema bracket access, expanded renderer normalization guidance, and refreshed validation builder notes.
- September 27, 2025 - Rebuilt the guide to cover the complete, generic monitor workflow with file-by-file instructions, testing requirements, and troubleshooting guidance.

Happy shipping. If you discover additional integration steps, update this guide alongside your code change so the next engineer starts from a precise source of truth.
