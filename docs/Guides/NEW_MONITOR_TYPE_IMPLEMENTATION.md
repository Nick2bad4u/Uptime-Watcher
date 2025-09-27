# Uptime Monitoring System - New Monitor Type Implementation Guide

_Last reviewed: September 27, 2025_

This guide walks you through every layer required to introduce a brand-new monitor type into the Uptime Monitoring System. It is written so that an engineer who has never touched this codebase can ship a production-ready monitor with confidence.

---

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

| Layer            | Responsibility                                   | Touch These Files                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Notes                                                                                                            |
| ---------------- | ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Shared           | Declare monitor type, config, validation         | `shared/types.ts`, `shared/types/monitorConfig.ts`, `shared/types/monitorTypes.ts`, `shared/types/schemaTypes.ts`, `shared/validation/schemas.ts`, `shared/utils/validation.ts`, `shared/utils/logTemplates.ts` (if new log codes), `shared/test/validation/schemas.comprehensive.test.ts`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Update unions, defaults, schemas, and add tests for both happy and error paths.                                  |
| Electron backend | Service logic, registry metadata, retry policies | `electron/services/monitoring/<NewMonitor>.ts`, `electron/services/monitoring/MonitorTypeRegistry.ts`, `electron/services/monitoring/EnhancedMonitorChecker.ts`, `electron/services/monitoring/types.ts`, `electron/services/monitoring/shared/monitorServiceHelpers.ts`, logger templates if you emit new messages, unit tests in `electron/test/services/monitoring`, fuzz tests in `electron/test/fuzzing`                                                                                                                                                                                                                                                                                                                                                                     | Make sure the new service is routed, retried, logged, and versioned.                                             |
| Persistence      | Persist dynamic fields and history               | `electron/services/database/utils/dynamicSchema.ts`, `electron/services/database/utils/monitorMapper.ts`, `electron/services/database/MonitorRepository.ts`, tests in `electron/test/fuzzing/databaseSchema.*.test.ts`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Dynamic schema generation reads registry fields; confirm snake_case column names and SQL types.                  |
| Renderer         | Collect config, validate, display                | `src/types/monitorFormData.ts`, `src/types/monitor-forms.ts`, `src/utils/monitorValidation.ts`, `src/stores/sites/utils/monitorOperations.ts`, `src/stores/monitor/useMonitorTypesStore.ts`, `src/components/SiteDetails/useAddSiteForm.ts`, `src/components/AddSiteForm/AddSiteForm.tsx`, `src/components/AddSiteForm/DynamicMonitorFields.tsx`, `src/components/AddSiteForm/Submit.tsx`, `src/components/Dashboard/SiteCard/components/MonitorSelector.tsx`, `src/constants.ts`, `src/utils/fallbacks.ts`, renderer tests (`src/test/hooks/useAddSiteForm.comprehensive.test.ts`, `src/test/comprehensive-100-percent-coverage.test.tsx`, `src/test/fuzzing/monitor-operations.fuzz.test.ts`, `src/test/stores/sites/utils/monitorOperations.fast-check-comprehensive.test.ts`) | Maintain parity between shared schemas and client validation, and keep UI fallbacks working when IPC is offline. |
| Tooling and docs | Keep documentation and changelog in sync         | `docs/Guides/NEW_MONITOR_TYPE_IMPLEMENTATION.md`, `CHANGELOG.md`, release notes, runbooks                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Record user-facing changes and rollout instructions.                                                             |

Use this table as a printable checklist before opening a pull request.

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
   - Provide defaults in `DEFAULT_MONITOR_CONFIG.<type>` that respect system-wide retry and timeout conventions.
3. Update shared monitor metadata helpers as needed in `shared/types/monitorTypes.ts`.
4. Add Zod schemas
   - Define `newMonitorSchema` in `shared/validation/schemas.ts` and include it in the discriminated union `monitorSchema`.
   - Export a typed alias in `shared/types/schemaTypes.ts` for IDE support and cross-package imports.
5. Field-level validation
   - Add a dedicated validator in `shared/utils/validation.ts` so error messages remain human readable.
6. Shared tests
   - Extend `shared/test/validation/schemas.comprehensive.test.ts` with happy and failure cases covering the new schema.

Run the shared unit tests before moving on: `npm test -- --run tests/shared`.

---

### Step 2 - Implement and Register the Backend Service

1. Create the service class
   - Add `electron/services/monitoring/<NewMonitor>.ts` implementing `IMonitorService` from `electron/services/monitoring/types.ts`.
   - Reuse helpers like `validateMonitorHostAndPort`, `extractMonitorConfig`, and `withOperationalHooks` from `electron/services/monitoring/shared/monitorServiceHelpers.ts` to match retry behaviour.
2. Write unit tests
   - Mirror `electron/test/services/monitoring/SslMonitor.test.ts`. Cover success, degraded thresholds, failure states, timeouts, and invalid configurations.
3. Register the monitor type
   - Update `electron/services/monitoring/MonitorTypeRegistry.ts`:
     - Import the service and call `registerMonitorType({ ... })` with description, display name, `fields` metadata, `serviceFactory`, `uiConfig`, and `validationSchema` (the shared schema you added).
     - Set the implementation version through `versionManager.setVersion(type, semver)`.
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
2. Row to object mapping
   - `mapMonitorToRow` and `mapRowToMonitor` iterate over registry field definitions. Confirm the new fields appear in both directions and update tests if you need custom conversion logic.
   - Adjust `electron/services/database/utils/monitorMapper.ts` tests when defaults or conversions change.
3. Repository operations
   - `MonitorRepository.createInternal` and `bulkCreate` rely on generated SQL. Run repository tests or add new ones if the monitor requires special handling (for example, cascading history writes).
4. Database schema tests
   - Update fuzz suites in `electron/test/fuzzing/databaseSchema.*.test.ts` so they include the new monitor fields. Failures here usually point to naming or type mismatches.

Verification tip: start the Electron app after registering the monitor. The database bootstrap (`createDatabaseTables`) will throw immediately if metadata produces invalid SQL.

---

### Step 4 - Wire Up the Renderer

1. Monitor types store
   - `useMonitorTypesStore` in `src/stores/monitor/useMonitorTypesStore.ts` consumes backend metadata. Update tests if they assert the list of known types.
2. Form data shapes
   - Extend `src/types/monitorFormData.ts` and `src/types/monitor-forms.ts` with interfaces, type guards, and default factories for the new type.
   - Ensure `createDefaultFormData` returns sensible defaults that match the shared defaults.
3. Client-side validation
   - In `src/utils/monitorValidation.ts`, add field-level validation and wire the new type into `validateMonitorFormDataByType`. Match error messages to the shared schema whenever possible.
4. Monitor normalization
   - Update `src/stores/sites/utils/monitorOperations.ts` so `filterMonitorFieldsByType`, type-specific default appliers, and `normalizeMonitor` understand the new fields.
5. Form state management
   - Extend `src/components/SiteDetails/useAddSiteForm.ts` to initialise state, reset values, and expose setters for the new fields.
   - Update `src/components/AddSiteForm/AddSiteForm.tsx`, `DynamicMonitorFields.tsx`, and `Submit.tsx` so inputs render and submissions convert string fields into typed values.
6. Fallback options and UI polish
   - Add the human-friendly label to `FALLBACK_MONITOR_TYPE_OPTIONS` in `src/constants.ts`.
   - Update helpers that print monitor labels, such as `src/utils/fallbacks.ts` and `src/components/Dashboard/SiteCard/components/MonitorSelector.tsx`.
7. Renderer tests
   - Expand `src/test/hooks/useAddSiteForm.comprehensive.test.ts` to cover state transitions, resetting, and submission success.
   - Update regression and fuzz suites: `src/test/comprehensive-100-percent-coverage.test.tsx`, `src/test/fuzzing/monitor-operations.fuzz.test.ts`, and `src/test/stores/sites/utils/monitorOperations.fast-check-comprehensive.test.ts`.

Goal: a user can add the monitor through the UI, validation responds correctly, and labels render without custom components.

---

### Step 5 - Validation, Testing, and Tooling

Run these commands after finishing code changes:

1. `npm run lint`
2. `npm run type-check`
3. `npm test -- --run tests/shared`
4. `npm test -- --run tests/electron`
5. `npm test -- --run tests/renderer`
6. `npm test -- --project fuzz`
7. Optional manual run: launch the Electron app, add the monitor, and tail logs to confirm details.

Capture any additional scripts, environment variables, or fixtures required to exercise the monitor so QA can automate scenarios.

---

### Step 6 - Deployment and Release Checklist

- [ ] All automated tests above pass locally and in CI.
- [ ] Updated user docs, runbooks, and screenshots if the UI changed.
- [ ] Updated `CHANGELOG.md` and release notes with the new monitor capability.
- [ ] Completed security or privacy review if the monitor touches new protocols or credentials.
- [ ] Verified dynamic schema output against staging or production snapshots when possible.
- [ ] Finalized rollout plan (feature flag, staged release, or full launch).

Once merged, monitor the first production checks closely. Add telemetry if the monitor depends on upstream services whose outages you want to isolate.

---

## 6. Troubleshooting and FAQ

| Symptom                                               | Likely Cause                                                                   | Fix                                                                                                                            |
| ----------------------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| Monitor type missing from dropdowns                   | `registerMonitorType` not called, or the store still relies on fallback data   | Verify the registry entry in `MonitorTypeRegistry.ts` and check the Electron main process logs for import failures.            |
| Validation errors differ between backend and frontend | Shared schema not updated or client-side validation diverged                   | Confirm `shared/validation/schemas.ts` and `src/utils/monitorValidation.ts` enforce identical rules. Add tests for both paths. |
| Database errors on startup                            | Field metadata does not map cleanly to SQL column types                        | Inspect `generateDatabaseFieldDefinitions` output and ensure each field maps to the correct SQL type.                          |
| Monitor never runs in production                      | `EnhancedMonitorChecker` missing a case or the service throws before returning | Look for `[EnhancedMonitorChecker]` warnings in logs and add unit tests that reproduce the failure.                            |
| UI renders blank fields                               | `DynamicMonitorFields` did not receive field metadata                          | Confirm the registry `fields` array is correct and that `useMonitorTypesStore` loads without IPC errors.                       |

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
   historyDetail: (details) => `Details: ${details}`,
  },
  supportsResponseTime: true,
 },
 validationSchema: monitorSchemas.newMonitor,
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

  const { retryAttempts, timeout } = extractMonitorConfig(
   monitor,
   this.config.timeout
  );

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

- September 27, 2025 - Rebuilt the guide to cover the complete, generic monitor workflow with file-by-file instructions, testing requirements, and troubleshooting guidance.

Happy shipping. If you discover additional integration steps, update this guide alongside your code change so the next engineer starts from a precise source of truth.
