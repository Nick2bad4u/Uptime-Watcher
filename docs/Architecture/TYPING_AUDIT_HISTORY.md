---
schema: "../../config/schemas/doc-frontmatter.schema.json"
title: "Typing Audit History"
summary: >-
  Consolidated record of the Electron, renderer, Zustand, and repo-wide typing
  audits produced during the 2025 refactor, including the comprehensive file
  review tracker for future AI/context use.
created: "2025-12-01"
last_reviewed: "2025-12-01"
category: "architecture"
author: "AI Pair"
tags:
  - "typing"
  - "audit"
  - "architecture"
  - "history"
---

# Typing Audit History

This historical document aggregates every typing-related audit and tracker we
produced during the November–December 2025 hardening effort. Each section
retains the original findings, scope, and recommended actions so future
contributors (human or AI) can quickly regain the necessary context without
opening multiple standalone files.

## 1. Electron Platform Audits

### 1.1 Electron Database Typing Audit (2025-11-28)

#### Purpose (Database Audit)

Roadmap Item **28** required a systematic survey of
`electron/services/database/**/*` to highlight every remaining `unknown` or
`UnknownRecord` dependency. Capturing those hotspots ensures the follow-up
typed-row work (roadmap items 29–31) does not miss hidden edge cases.

#### Status (Database Audit, 2025-11-28)

- Row interfaces (`MonitorRow`, `SiteRow`, `HistoryRow`, `SettingsRow`) live in
  `shared/types/database.ts` with documentation, branded identifiers, and runtime
  validators.
- Typed query helpers in `electron/services/database/utils/typedQueries.ts`
  expose narrowed accessors (`queryMonitorRow`, `queryHistoryRows`, etc.).
- Core repositories now consume typed rows, eliminating `UnknownRecord` returns.
- Repository + helper tests (e.g.,
  `electron/test/services/database/utils/typedQueries.test.ts`) enforce the new
  inference paths.

#### Findings by Area (Database Audit)

1. **DatabaseService** still pipes raw driver rows and uses unstructured error
   metadata.
2. **Repositories** continue to expose `UnknownRecord` in mappers and metadata
   bags for headers/body automation.
3. **Typed query utilities** rely on permissive helpers that return
   `UnknownRecord` when predicates fail.
4. **Dynamic schema helpers** manipulate monitor drafts via casts rather than
   typed builders.
5. **Monitor/history mappers** depend on `UnknownRecord` indexing and
   `unknown`-typed sanitizers.

#### Suggested Next Steps (Database Audit)

| Step | Scope                                   | Outcome                                                                |
| ---- | --------------------------------------- | ---------------------------------------------------------------------- |
| 1    | Define row interfaces + branded IDs     | Remove `UnknownRecord` spreads and clarify nullable columns.           |
| 2    | Update typed query utilities            | Make SQL helpers return `Simplify<TRow>` instead of `UnknownRecord`.   |
| 3    | Refactor repositories to use typed rows | Allow repositories to expose typed domain objects without casts.       |
| 4    | Harden dynamic schema + converters      | Align runtime schema transforms with compile-time monitor/site drafts. |
| 5    | Emit follow-up tests                    | Keep row types synchronized with migrations and shared DTOs.           |

### 1.2 Electron Events Typing Audit (2025-11-27)

#### Purpose (Events Audit)

Roadmap item **25** demanded an inventory of every loose
surface inside `electron/events/**/*` so tasks 26–27 could be scoped precisely.

#### Findings (Events Audit)

- `eventTypes.ts` still exposes `{ [key: string]: unknown }` metadata bags and
  lacks discriminated unions for lifecycle payloads.
- `TypedEventBus.ts` allowed primitive payloads, returned `unknown` from
  `createEnhancedData`, and gave middleware no typed metadata.
- `ScopedSubscriptionManager` duplicated listener types and skipped the string
  constraint enforced by `TypedEventBus`.
- Middleware typing (after roadmap item 27) now respects the refined generics—no
  outstanding issues remain there.

#### Usage Hotspots & Next Steps (Events Audit)

1. Harden event bus generics (non-primitive payloads, reusable
   `EnhancedEventPayload`, metadata envelopes).
2. Brand middleware options and callbacks with typed event names.
3. Convert remaining `[key: string]: unknown` pockets in `eventTypes.ts` into
   branded metadata unions.

### 1.3 Operational Hooks Typing Audit (2025-11-27)

#### Purpose (Operational Hooks Audit)

Roadmap task **46** scoped `electron/utils/operationalHooks.ts` so the follow-up effort could replace
the remaining `UnknownRecord` placeholders with branded contracts.

#### Findings (Operational Hooks Audit)

1. Contexts and metadata remain unstructured (`UnknownRecord`).
2. Hook payloads expose `result?: unknown`, even though `OperationalHooksConfig`
   already knows the success type.
3. Lifecycle events mash all context kinds together, preventing listeners from
   narrowing by operation.
4. Strategies (`successStrategy`, `retryStrategy`) operate on shapeless payloads.

#### Recommendations (Operational Hooks Audit)

- Introduce discriminated context unions and branded metadata per operation
  kind.
- Thread `TResult` through payloads and lifecycle events.
- Make hook configs generic over `{ Context, Metadata, Result }` and ensure
  strategy callbacks share those generics.

## 2. Renderer Audits

### 2.1 Renderer Hooks Typing Audit (2025-11-28)

#### Purpose (Renderer Hooks Audit)

Roadmap item **42** required an inventory of renderer hook files that still accept loose
payloads (`string`, `Record<string, unknown>`, etc.) rather than shared types.

#### Findings (Renderer Hooks Audit)

1. `useMonitorFields.ts` and `useMonitorTypes.ts` rely on `string` monitor
   identifiers and return ambiguous empty arrays when configs are unknown.
2. `site/useSiteDetails.ts` tracks monitor IDs as raw strings, bypassing the new
   typed store helpers.

#### Recommendations (Renderer Hooks Audit)

- Replace every ad-hoc monitor type string with the shared `MonitorType`
  literal union (or a tagged subtype).
- Surface explicit "unknown type" states instead of returning empty arrays.
- Thread typed identifiers through Zustand selectors and helper hooks so the UI
  can no longer dispatch invalid `(siteId, monitorId)` tuples.

### 2.2 Renderer Types Typing Audit (2025-11-28)

#### Purpose (Renderer Types Audit)

Roadmap item **33** targeted `src/types/**/*`, highlighting divergence between renderer
helpers and their shared counterparts.

#### Findings (Renderer Types Audit)

1. `src/types/monitorFormData.ts` redefines every monitor form interface,
   accepts `type: string`, and leaves dependent fields partially constrained.
2. `src/types/monitor-forms.ts` duplicates monitor field descriptions and still
   relies on `UnknownRecord` change handlers.
3. `src/types/ipc.ts` reimplements the IPC envelope instead of re-exporting the
   shared helpers and lacks excess-property checks.

#### Recommended Follow-ups (Renderer Types Audit)

| Roadmap Item | Scope                    | Action                                                                                                                   |
| ------------ | ------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| 34           | `monitorFormData.ts`     | Import shared monitor configuration inputs, enforce `RequireAllOrNone`, and align `type` fields with `MonitorType`.      |
| 35           | `src/types/ipc.ts`       | Re-export shared IPC helpers and wrap guards with `Exact<>` to forbid excess properties.                                 |
| 38           | Renderer monitor helpers | Update `monitorUiHelpers.ts` / `monitorTitleFormatters.ts` to depend on the shared unions once the form types are fixed. |

## 3. Zustand Store Typing Audit (2025-11-28)

### Scope (Zustand Store Audit)

Roadmap item **40** inspected `src/stores/**/*` for lingering `UnknownRecord`
dependencies.

### Key Findings (Zustand Store Audit)

1. `sites/utils/monitorOperations.ts` mutates monitors via `UnknownRecord`
   casts; needs typed builder helpers.
2. `sites/utils/operationHelpers.ts` stores operation templates as
   `UnknownRecord` maps instead of discriminated unions.
3. `sites/useSiteMonitoring.ts` emits `Record<string, unknown>` telemetry rather
   than the shared monitoring event interfaces.
4. `sites/useSiteSync.ts` logs sync failures as unstructured metadata.
5. `monitor/operations.ts` serializes operations by downcasting to
   `Record<string, unknown>` for logging.

### Next Steps (Zustand Store Audit)

1. Draft typed payload interfaces per monitor operation phase.
2. Update Zustand slices to emit those interfaces end-to-end.
3. Backfill property-based tests to guard against regressions into
   `UnknownRecord` payloads.

## 4. Repo-Wide File Review Tracker (2025-12-01)

The table below captures the state of every staged file at the conclusion of
the refactor. Each entry notes whether the file has been reviewed and summarizes
the rationale for its modifications.

| File                                                                       | Status   | Notes                                                                                                                                         |
| -------------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| benchmarks/event-system/ipcCommunication.bench.ts                          | Reviewed | Added typed IPC mock payloads/handlers; async handlers wrapped in Promise.resolve.                                                            |
| benchmarks/shared/errorHandling.bench.ts                                   | Reviewed | Serializes Error objects before benchmarking safeJsonStringifyWithFallback.                                                                   |
| docs/Architecture/ADRs/ADR\_002\_EVENT\_DRIVEN\_ARCHITECTURE.md            | Reviewed | Updated rate-limit middleware example to new callback signature.                                                                              |
| docs/docusaurus/src/css/custom.css                                         | Reviewed | Expanded homepage selectors to hide copy button & navbar sidebar outside docs/blog.                                                           |
| docs/docusaurus/src/pages/index.module.css                                 | Reviewed | Added overflow guards for tech section/code blocks to prevent mobile horizontal scroll.                                                       |
| electron/UptimeOrchestrator.ts                                             | Reviewed | Added typed snapshot overlay utilities and safer metadata propagation for manual check + monitoring responses.                                |
| electron/events/ScopedSubscriptionManager.ts                               | Reviewed | Switched to TypedEventBus generics/TypedEventListener for scoped subscriptions.                                                               |
| electron/events/TypedEventBus.ts                                           | Reviewed | Introduced typed payload helpers, structured cloning, metadata preservation, and middleware executor tracking.                                |
| electron/events/eventTypes.ts                                              | Reviewed | Event map now uses typed EventPayloadValue, serialized errors, new monitoring response event, and exported name union.                        |
| electron/events/middleware.ts                                              | Reviewed | Refactored middleware utils with typed helpers, safe serialization, rate limit contexts, and typed stack factories.                           |
| electron/services/ServiceContainer.ts                                      | Reviewed | Forwarding helpers now use typed event names/payloads and safely strip metadata before delegating to the orchestrator.                        |
| electron/services/application/ApplicationService.ts                        | Reviewed | Renderer bridge interactions now strip orchestrator metadata before emitting events and reuse typed helper utilities.                         |
| electron/services/commands/DatabaseCommands.ts                             | Reviewed | emitFailureEvent/emitSuccessEvent now use typed event keys and payloads.                                                                      |
| electron/services/database/HistoryRepository.ts                            | Reviewed | History pruning now reuses typed queryForIds helper instead of manual casts.                                                                  |
| electron/services/database/MonitorRepository.ts                            | Reviewed | Repository now uses queryMonitorRow/queryMonitorRows helpers instead of manual type assertions.                                               |
| electron/services/database/SettingsRepository.ts                           | Reviewed | Replaced manual row coercion with typed helpers and simplified get/getAll queries.                                                            |
| electron/services/database/SiteRepository.ts                               | Reviewed | Query helpers now provide typed site rows, eliminating manual casts.                                                                          |
| electron/services/database/utils/historyManipulation.ts                    | Reviewed | Uses queryForIds helper for pruning excess history rows instead of manual casts.                                                              |
| electron/services/database/utils/historyQuery.ts                           | Reviewed | Replaced manual db.all/get casts with typed queryHistoryRows/queryForCount helpers plus better error logging.                                 |
| electron/services/database/utils/typedQueries.ts                           | Reviewed | Added row validation helpers plus history/monitor/settings/site query wrappers and safer count/id handling.                                   |
| electron/services/ipc/IpcService.ts                                        | Reviewed | IPC handlers now use typed invoke channels, helper wrappers, and metadata stripping before renderer emission.                                 |
| electron/services/ipc/types.ts                                             | Reviewed | Validators now accept readonly parameter arrays to align with register handler usage.                                                         |
| electron/services/ipc/utils.ts                                             | Reviewed | IPC handler utilities now leverage typed invoke channels, metadata-aware logging, and readonly parameter validation.                          |
| electron/services/ipc/validators.ts                                        | Reviewed | Param validators now accept readonly arrays and preload/notification validators updated accordingly.                                          |
| electron/services/monitoring/CdnEdgeConsistencyMonitor.ts                  | Reviewed | Monitor now uses shared MonitorServiceConfig type for constructor/updateConfig.                                                               |
| electron/services/monitoring/DnsMonitor.ts                                 | Reviewed | Switched service config typing to MonitorServiceConfig and updated docs/accessors accordingly.                                                |
| electron/services/monitoring/HttpHeaderMonitor.ts                          | Reviewed | Factory now accepts MonitorServiceConfig instead of monitor-level config.                                                                     |
| electron/services/monitoring/HttpJsonMonitor.ts                            | Reviewed | Monitor factory now consumes MonitorServiceConfig to align with new shared type.                                                              |
| electron/services/monitoring/HttpKeywordMonitor.ts                         | Reviewed | Monitor builder updated to accept MonitorServiceConfig type.                                                                                  |
| electron/services/monitoring/HttpLatencyMonitor.ts                         | Reviewed | Service factory updated to use MonitorServiceConfig type alias.                                                                               |
| electron/services/monitoring/HttpMonitor.ts                                | Reviewed | Base HTTP monitor now references MonitorServiceConfig.                                                                                        |
| electron/services/monitoring/HttpStatusMonitor.ts                          | Reviewed | Base configuration now references MonitorServiceConfig.                                                                                       |
| electron/services/monitoring/MigrationSystem.ts                            | Reviewed | Migration rules now operate on MonitorConfigurationInput with stronger validation/logging.                                                    |
| electron/services/monitoring/MonitorFactory.ts                             | Reviewed | Factory/getMonitor/updateConfig now reference shared MonitorServiceConfig type alias.                                                         |
| electron/services/monitoring/MonitorTypeRegistry.ts                        | Reviewed | Registry now shares MonitorTypeConfig contracts, enforces MonitorConfiguration types, and improves migration errors.                          |
| electron/services/monitoring/PingMonitor.ts                                | Reviewed | Ping monitor now uses MonitorServiceConfig for ctor/getConfig/updateConfig docs + types.                                                      |
| electron/services/monitoring/PortMonitor.ts                                | Reviewed | Port monitor docs/types now reference MonitorServiceConfig and updated getters/setters accordingly.                                           |
| electron/services/monitoring/ReplicationMonitor.ts                         | Reviewed | Monitor factory/threshold resolution switched to MonitorServiceConfig typing.                                                                 |
| electron/services/monitoring/ServerHeartbeatMonitor.ts                     | Reviewed | Uses MonitorServiceConfig for heartbeat monitor factory and drift resolution helpers.                                                         |
| electron/services/monitoring/SslMonitor.ts                                 | Reviewed | SSL monitor config/update now reference MonitorServiceConfig type.                                                                            |
| electron/services/monitoring/WebsocketKeepaliveMonitor.ts                  | Reviewed | Configuration API now uses MonitorServiceConfig for websocket keepalive monitor.                                                              |
| electron/services/monitoring/shared/httpMonitorCore.ts                     | Reviewed | HTTP monitor factory + adapter now operate on MonitorServiceConfig throughout.                                                                |
| electron/services/monitoring/shared/monitorCoreHelpers.ts                  | Reviewed | Helper deriveMonitorTiming now consumes MonitorServiceConfig.                                                                                 |
| electron/services/monitoring/shared/remoteMonitorCore.ts                   | Reviewed | Remote monitor factory/configuration now operate on MonitorServiceConfig.                                                                     |
| electron/services/monitoring/types.ts                                      | Reviewed | Introduced MonitorServiceConfig/MonitorConfiguration types and updated IMonitorService contract accordingly.                                  |
| electron/services/monitoring/utils/httpClient.ts                           | Reviewed | HTTP client creation uses MonitorServiceConfig and AxiosRequestConfig with stricter typing.                                                   |
| electron/test/UptimeOrchestrator.test.ts                                   | Reviewed | Tests updated to emit typed internal site events with operation field instead of casting to any.                                              |
| electron/test/events/ScopedSubscriptionManager.property.test.ts            | Reviewed | Property tests now use EventPayloadValue-based event map instead of UnknownRecord.                                                            |
| electron/test/events/ScopedSubscriptionManager.test.ts                     | Reviewed | Test event maps now typed with EventPayloadValue instead of UnknownRecord.                                                                    |
| electron/test/events/TypedEventBus.comprehensive.test.ts                   | Reviewed | Comprehensive tests now type TestEvents via EventPayloadValue and add index signatures accordingly.                                           |
| electron/test/events/TypedEventBus.test.ts                                 | Reviewed | Basic tests now type event map entries via EventPayloadValue w/ index signatures.                                                             |
| electron/test/events/eventTypes.comprehensive.test.ts                      | Reviewed | Tests now leverage UptimeEventName alias when checking categories/priorities.                                                                 |
| electron/test/events/middleware.comprehensive.test.ts                      | Reviewed | Tests updated for new logging/validation behavior using EventPayloadValue helpers and updated expectations.                                   |
| electron/test/fuzzing/event-bus.fuzz.test.ts                               | Reviewed | Fuzz tests updated to type event map via EventPayloadValue with string/symbol index signatures.                                               |
| electron/test/high-impact-coverage.test.ts                                 | Reviewed | Coverage tests now use unsafeJsonifiable helper and UptimeEventName casts for new type expectations.                                          |
| electron/test/middleware.test.ts                                           | Reviewed | Updated tests for new logging/validation signatures using EventPayloadValue helpers and richer onRateLimit context.                           |
| electron/test/monitoringTypes.test.ts                                      | Reviewed | Tests renamed to MonitorServiceConfig and updated mocks to use new type.                                                                      |
| electron/test/services/commands/DatabaseCommands.test.ts                   | Reviewed | Tests now use EventKey generics and expect new operation field default for internal database events.                                          |
| electron/test/services/database/HistoryRepository.test.ts                  | Reviewed | Tests now expect query helper calls with explicit undefined params when selecting monitor ids.                                                |
| electron/test/services/database/MonitorRepository.test.ts                  | Reviewed | Sample monitor rows now include site\_identifier to satisfy stricter validator.                                                               |
| electron/test/services/database/SettingsRepository.test.ts                 | Reviewed | Tests now assert db.all called with explicit undefined params for SELECT \* query.                                                            |
| electron/test/services/database/utils/typedQueries.test.ts                 | Reviewed | Tests expanded for new validation helpers, typed row wrappers, and explicit undefined param expectations.                                     |
| electron/test/services/ipc/types.test.ts                                   | Reviewed | Validators in tests now use readonly parameter arrays to align with production types.                                                         |
| electron/test/services/ipc/utils.comprehensive.test.ts                     | Reviewed | Tests now use real channel constants + typed handler sets to match new registerStandardizedIpcHandler API.                                    |
| electron/test/services/ipc/validatorComposition.test.ts                    | Reviewed | Validators/composers updated to accept readonly parameter arrays matching new type signature.                                                 |
| electron/test/services/monitoring/HttpMonitor.comprehensive.test.ts        | Reviewed | Test configs now use MonitorServiceConfig when constructing HttpMonitor.                                                                      |
| electron/test/services/monitoring/MigrationSystem.comprehensive.test.ts    | Reviewed | Tests now wrap migration inputs with MonitorServiceConfig helper to satisfy new typing.                                                       |
| electron/test/services/monitoring/MonitorFactory.fixed.test.ts             | Reviewed | Tests now use MonitorServiceConfig typing for mock config objects.                                                                            |
| electron/test/services/monitoring/MonitorFactory.test.ts                   | Reviewed | Monitor factory tests now type configs via MonitorServiceConfig.                                                                              |
| electron/test/services/monitoring/PingMonitor.test.ts                      | Reviewed | Ping monitor tests now reference MonitorServiceConfig for config objects and updates.                                                         |
| electron/test/services/monitoring/types.test.ts                            | Reviewed | Unit tests now assert MonitorServiceConfig typing and updated IMonitorService mock signatures.                                                |
| electron/test/services/monitoring/utils/httpClient.test.ts                 | Reviewed | Tests now reference MonitorServiceConfig when exercising createHttpClient/setup timing interceptors.                                          |
| electron/test/utils/database/DataBackupService.test.ts                     | Reviewed | Tests now expect structured error objects when download backup failures emit database:error events.                                           |
| electron/test/utils/database/DataImportExportService.comprehensive.test.ts | Reviewed | Assertions now expect structured Error objects when database:error events fire during export/import failures.                                 |
| electron/test/utils/database/SiteRepositoryService.comprehensive.test.ts   | Reviewed | Tests now assert database:error events carry Error instances converted from thrown values.                                                    |
| electron/test/utils/operationalHooks.test.ts                               | Reviewed | Added tests for createOperationalHookContext branding and lifecycle event emissions with typed event bus.                                     |
| electron/utils/cache/StandardizedCache.ts                                  | Reviewed | Cache now supports typed keys/values, iterable bulk updates, and async invalidation callbacks with promise detection.                         |
| electron/utils/database/DataBackupService.ts                               | Reviewed | Backup errors now normalized via ensureError/toSerializedError before emitting database:error and throwing.                                   |
| electron/utils/database/DataImportExportService.ts                         | Reviewed | Export now normalizes payloads via toJsonifiable and import parsing emits serialized errors with stricter type guards.                        |
| electron/utils/database/SiteRepositoryService.ts                           | Reviewed | Cache loading failures now normalize errors via ensureError/toSerializedError before emitting database:error.                                 |
| electron/utils/database/databaseInitializer.ts                             | Reviewed | Initialization failures now serialize errors before emitting database:error while still rethrowing original exception.                        |
| electron/utils/errorSerialization.ts                                       | Reviewed | Added helper to convert unknown errors into ExtendedError using serializeError with property cloning fallback.                                |
| electron/utils/eventMetadataForwarding.ts                                  | Reviewed | Exposed isEventMetadata guard for reuse while delegating to internal candidate check.                                                         |
| electron/utils/operationalHooks.ts                                         | Reviewed | Added branded operational hook context helpers plus lifecycle event tagging and logging of normalized context.                                |
| scripts/sort-frontmatter.mjs                                               | Reviewed | Simplified key detection using optional chaining fallback for anonymous blocks.                                                               |
| shared/ipc/rendererEvents.ts                                               | Reviewed | Renderer event types now re-export shared definitions instead of duplicating payload maps.                                                    |
| shared/test/fuzzing/jsonSafety.fuzz.test.ts                                | Reviewed | Rebuilt fuzz suite focusing on round-trip JSON values, fallback handling, and unsafeJsonifiable inputs.                                       |
| shared/test/fuzzing/safeConversions.fuzz.test.ts                           | Reviewed | Updated timeout property test to clamp results to MAX\_TIMEOUT\_MILLISECONDS per new logic.                                                   |
| shared/test/helpers/jsonTestHelpers.ts                                     | Reviewed | Added unsafeJsonifiable/acceptAnyJsonValue helpers for negative jsonSafety tests.                                                             |
| shared/test/jsonSafety.property.test.ts                                    | Reviewed | Property tests now normalize JSON arrays via JSON.parse to avoid -0 discrepancies and expect fallback on BigInt.                              |
| shared/test/strictTests/validationGuards-complete-coverage.test.ts         | Reviewed | Assertions updated to check new status field instead of success boolean.                                                                      |
| shared/test/ultimate-function-coverage-boost.test.ts                       | Reviewed | Removed redundant coverage booster with unsafe blanket calls; replaced by targeted per-suite tests elsewhere.                                 |
| shared/test/utils/jsonSafety-extra.test.ts                                 | Reviewed | Removed redundant jsonSafety extra coverage test superseded by focused fuzz/property suites.                                                  |
| shared/test/utils/jsonSafety.behavior.test.ts                              | Reviewed | Added focused behavior tests covering JSON parse/stringify helpers with new validators and helpers.                                           |
| shared/test/utils/jsonSafety.comprehensive.test.ts                         | Reviewed | Removed overly broad jsonSafety comprehensive suite in favor of focused behavior/fuzz coverage.                                               |
| shared/test/utils/jsonSafety.test.ts                                       | Reviewed | Removed outdated monolithic jsonSafety suite replaced by behavior/fuzz-specific tests.                                                        |
| shared/test/utils/safeConversions.test.ts                                  | Reviewed | Tests updated to assert new clamping behavior with MIN/MAX timeout constants.                                                                 |
| shared/types.ts                                                            | Reviewed | StatusUpdate now extends readonly record + forbids array-like usage via length/index signatures.                                              |
| shared/types/chartHybrid.ts                                                | Reviewed | Datasets/elements now typed as UnknownRecord to avoid overly loose index signatures.                                                          |
| shared/types/componentProps.ts                                             | Reviewed | ComponentProperties now parameterized with explicit base + UnknownRecord override default for better typing.                                  |
| shared/types/configTypes.ts                                                | Reviewed | Theme + monitor status now use LiteralUnion for extensibility and exported ThemeIdentifier alias.                                             |
| shared/types/events.ts                                                     | Reviewed | Added renderer event payload map/union plus stricter BaseEventData typing and start/stop payload helpers.                                     |
| shared/types/ipc.ts                                                        | Reviewed | Added diagnostics event union/channel types, made backup metadata optional, and typed guard metadata as UnknownRecord.                        |
| shared/types/monitorTypes.ts                                               | Reviewed | isPlainObject now returns UnknownRecord to align with strict typing.                                                                          |
| shared/types/schemaTypes.ts                                                | Reviewed | Added LiteralUnion-based DnsRecordType and MonitorSchemaIdentifier exports for extensible autocomplete.                                       |
| shared/types/themeConfig.ts                                                | Reviewed | ThemeOverride now uses PartialDeep per section and merge utilities rely on type-safe deepMergeSection helper.                                 |
| shared/types/units.ts                                                      | Reviewed | Added branded PortNumber/TimeoutMilliseconds types with validators and shared min/max constants.                                              |
| shared/types/validation.ts                                                 | Reviewed | isValidationResult now narrows via UnknownRecord instead of generic Record.                                                                   |
| shared/utils/jsonSafety.ts                                                 | Reviewed | Rewrote helpers to use JsonValue/Jsonifiable typing, added serialization guards, array validator improvements, and fallback behavior cleanup. |
| shared/utils/logTemplates.ts                                               | Reviewed | Template variables now support controlled value types, structured union export, and safe interpolation formatting.                            |
| shared/utils/logger/common.ts                                              | Reviewed | SerializedError now declares index signatures to allow metadata cloning.                                                                      |
| shared/utils/safeConversions.ts                                            | Reviewed | Conversions now use branded timeout/port types with clamping helpers and shared unit constants.                                               |
| shared/utils/siteSnapshots.ts                                              | Reviewed | Added change-set helpers leveraging RequireAtLeastOne and deriveSiteSyncChangeSet for cleaner delta checks.                                   |
| shared/utils/stringConversion.ts                                           | Reviewed | safeStringify now leverages Jsonifiable guard and consistent complex-object placeholders ({} for WeakMap/WeakSet).                            |
| shared/utils/typeGuards.ts                                                 | Reviewed | Property guards now return UnknownRecord intersections and isValidPort returns branded PortNumber.                                            |
| shared/validation/guards.ts                                                | Reviewed | Site snapshot validation now returns status-based ExclusifyUnion instead of boolean success flag.                                             |
| shared/validation/schemas.ts                                               | Reviewed | Added Jsonify-based MonitorJson/SiteJson aliases and optimized validatedDataSize calculation to reuse serialized data.                        |
| src/components/AddSiteForm/Submit.tsx                                      | Reviewed | Validation builders now use PartialMonitorFormDataByType generics to keep field mapping in sync with schema typing.                           |
| src/components/SiteDetails/SiteDetails.tsx                                 | Reviewed | Component now reads percentile metrics via nested analytics.percentileMetrics structure.                                                      |
| src/hooks/site/useSiteAnalytics.ts                                         | Reviewed | Hook now exposes percentileMetrics object and uses readonly arrays for filtered history calculations.                                         |
| src/services/EventsService.ts                                              | Reviewed | Monitoring start/stop guards now validate unknown payloads and log errors before invoking callbacks.                                          |
| src/services/SiteService.ts                                                | Reviewed | Snapshot validation now checks status === "success" per new guard return shape.                                                               |
| src/stores/sites/types.ts                                                  | Reviewed | SitesState now re-exports canonical shape from useSitesState to avoid divergence.                                                             |
| src/stores/sites/useSiteMonitoring.ts                                      | Reviewed | Dependency contract now reflects optional optimistic lock maps via Partial\<Record<...>>.                                                     |
| src/stores/sites/useSitesState.ts                                          | Reviewed | State now uses typed Site/Monitor identifiers, partial lock maps, key validators, and helper collectors for cleanup.                          |
| src/stores/sites/useSitesStore.ts                                          | Reviewed | Simplified zustand store factory signature to rely on default typings.                                                                        |
| src/stores/sites/utils/optimisticMonitoringLock.ts                         | Reviewed | Introduced branded OptimisticLockKey with validator and stronger key construction.                                                            |
| src/stores/sites/utils/statusUpdateHandler.ts                              | Reviewed | Added snapshot context type guard before optimistic merges and tightened log payload accessors.                                               |
| src/test/components/AddSiteForm/Submit.additional-coverage.test.tsx        | Reviewed | Validation mocks updated to include metadata per new ValidationResult shape.                                                                  |
| src/test/components/AddSiteForm/Submit.comprehensive.test.fixed.tsx        | Reviewed | Tests now stub metadata on validation results to match new structure.                                                                         |
| src/test/components/AddSiteForm/Submit.comprehensive.test.tsx              | Reviewed | Shared validation success fixtures now include metadata to satisfy new ValidationResult shape.                                                |
| src/test/components/SiteDetails/SiteDetails.comprehensive.test.tsx         | Reviewed | Mock analytics now includes percentileMetrics to align with hook shape.                                                                       |
| src/test/components/SiteDetails/SiteDetails.modal-behavior.test.tsx        | Reviewed | Analytics fixtures now populate percentileMetrics, ensuring overrides remain consistent.                                                      |
| src/test/events/event-system.comprehensive-fuzzing.test.ts                 | Reviewed | Fuzz tests now use UptimeEventName type instead of casting to keyof UptimeEvents.                                                             |
| src/test/events/events.comprehensive-fuzzing.test.ts                       | Reviewed | Renderer-focused fuzz tests now rely on UptimeEventName typing instead of manual casts.                                                       |
| src/test/hooks/site/useSiteDetails.branch-coverage-new\.test.ts            | Reviewed | Analytics mocks now include percentileMetrics and validation stubs provide metadata/warnings to match new result type.                        |
| src/test/hooks/site/useSiteDetails.branch-coverage.test.ts                 | Reviewed | Validation mocks now include metadata/warnings arrays to satisfy new result contract.                                                         |
| src/test/hooks/site/useSiteDetails.test.ts                                 | Reviewed | Validation mocks now return metadata/warnings arrays, aligning with new result type.                                                          |
| src/test/ipc/ipc.comprehensive-fuzzing.test.ts                             | Reviewed | Fuzz suite now uses typed IpcInvokeChannel helpers, richer arbitraries, and realistic site/monitor payloads.                                  |
| src/test/services/EventsService.comprehensive.test.ts                      | Reviewed | Tests now use shared MonitoringStarted/Stopped types and distinct handler signatures matching runtime guards.                                 |
| src/test/useSiteAnalytics.test.ts                                          | Reviewed | Tests updated to assert nested percentileMetrics values instead of legacy p50/p95/p99 fields.                                                 |
| src/test/utils/jsonSafety.advanced-fuzzing.test.ts                         | Reviewed | Fuzz suite now uses JsonValue/Jsonifiable arbitraries with typed validators and richer complex object coverage.                               |
| src/test/utils/monitorValidation.advanced-types.test.ts                    | Reviewed | Advanced monitor scenarios now use PartialMonitorFormDataByType generics instead of generic form data.                                        |
| src/test/utils/monitorValidation.error-handling.test.ts                    | Reviewed | Helper resolveValidationResult now seeds metadata for new ValidationResult shape.                                                             |
| src/test/utils/monitorValidation.test.ts                                   | Reviewed | Tests now use typed HttpFormData keys when validating arbitrary field names and numeric port inputs.                                          |
| src/test/utils/status.property.test.ts                                     | Reviewed | Property tests now assert results via StatusWithIcon/StatusIdentifier types for stronger typing.                                              |
| src/test/utils/status.test.ts                                              | Reviewed | Unit tests now leverage StatusWithIcon/StatusIdentifier types when asserting formatting helpers.                                              |
| src/test/working-utility-coverage.test.ts                                  | Reviewed | Coverage harness now passes serializable object to safeJsonStringifyWithFallback per new guard behavior.                                      |
| src/theme/ThemeManager.ts                                                  | Reviewed | Color variable handling now uses typed helpers for emitting CSS properties and avoids unsafe type assertions.                                 |
| src/theme/useTheme.ts                                                      | Reviewed | Added resolveThemeColorPath helper using shared isRecord guard for safer color lookup.                                                        |
| src/types/ipc.ts                                                           | Reviewed | Renderer IPC types now alias shared diagnostics/response contracts and guard checks only allow known response keys.                           |
| src/types/monitor-forms.ts                                                 | Reviewed | Introduced RequireAllOrNone helpers, non-empty string guards, and stricter replication/heartbeat field typing.                                |
| src/types/monitorFormData.ts                                               | Reviewed | Monitor form types now reuse RequireAllOrNone helpers, non-empty string guards, and refined type guards for replication/heartbeat.            |
| src/types/typeUtils.ts                                                     | Reviewed | Added RequireAllOrNoneFields helper ensuring grouped form fields stay in sync.                                                                |
| src/utils/monitorTitleFormatters.ts                                        | Reviewed | Formatter registry now uses typed monitor keys, supports custom maps, and exposes reset helper.                                               |
| src/utils/monitorUiHelpers.ts                                              | Reviewed | Config fetch helper now centralizes cache key generation and improves documentation.                                                          |
| src/utils/monitorValidation.ts                                             | Reviewed | Validation utilities now share typed PartialMonitorFormDataByType helpers, centralized validator map, and enhanced type guards.               |
| src/utils/status.ts                                                        | Reviewed | Added branded StatusIdentifier type and updated createStatusIdentifier to return Tagged CamelCase string.                                     |
| tests/strictTests/electron/utils/database/databaseInitializer.test.ts      | Reviewed | Strict tests now assert serialized error payloads and use UptimeEventName type for channel assertions.                                        |

---

Maintaining this single historical record should keep future audits and AI
assistants grounded in the decisions already made during the 2025 refactor.
