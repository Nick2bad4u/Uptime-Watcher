---
schema: "../../config/schemas/doc-frontmatter.schema.json"
title: "Architecture Documentation Index"
summary: ">-"
created: "2025-08-05"
last_reviewed: "2025-11-19"
category: "guide"
author: "Nick2bad4u"
tags:
  - "uptime-watcher"
  - "architecture"
  - "adr"
  - "patterns"
  - "templates"
  - "standards"
---

# Architecture Documentation Index

## Table of Contents

1. [📁 Directory Structure](#-directory-structure)
2. [🏗️ Architecture Decision Records (ADRs)](#️-architecture-decision-records-adrs)
3. [📋 Development Patterns](#-development-patterns)
4. [🛠️ Code Templates](#️-code-templates)
5. [📚 Documentation Standards](#-documentation-standards)
6. [🧾 Generated Artifacts](#-generated-artifacts)
7. [🎯 Using This Documentation](#-using-this-documentation)
8. [🔄 Maintenance Guidelines](#-maintenance-guidelines)
9. [📊 Compliance Tracking](#-compliance-tracking)
10. [Current Documentation Audit (2025-11-04)](#current-documentation-audit-2025-11-04)
11. [🚀 Quick Start](#-quick-start)
12. [📞 Support](#-support)

## 📁 Directory Structure

```text
docs/Architecture/
├── README.md                     # This file
├── ADRs/                        # Architecture Decision Records
│   ├── ADR_001_REPOSITORY_PATTERN.md
│   ├── ADR_002_EVENT_DRIVEN_ARCHITECTURE.md
│   ├── ADR_003_ERROR_HANDLING_STRATEGY.md
│   ├── ADR_004_FRONTEND_STATE_MANAGEMENT.md
│   ├── ADR_005_IPC_COMMUNICATION_PROTOCOL.md
│   └── ADR_006_STANDARDIZED_CACHE_CONFIGURATION.md
├── generated/                   # Auto-generated reference artifacts
│   └── IPC_CHANNEL_INVENTORY.md
├── Patterns/                    # Development patterns guide
│   ├── COMPONENT_PROPS_STANDARDS.md
│   ├── DEVELOPMENT_PATTERNS_GUIDE.md
│   └── SITE_LOADING_ORCHESTRATION.md
├── Templates/                   # Code templates for common patterns
│   ├── IPC_HANDLER_TEMPLATE.md
│   ├── REPOSITORY_TEMPLATE.md
│   ├── REPOSITORY_TEMPLATE_CLEAN.md
│   └── ZUSTAND_STORE_TEMPLATE.md
├── UsageGuides/                 # Onboarding & navigation guidance
│   └── Using-This-Documentation.md
└── TSDOC_STANDARDS.md           # Documentation standards
```

### Architecture documentation map

```mermaid
flowchart TD
    classDef hub fill:#0f172a,stroke:#0f172a,stroke-width:2px,color:#f8fafc;
    classDef section fill:#e2e8f0,stroke:#1e293b,stroke-width:2px,color:#0f172a;
    classDef file fill:#fef3c7,stroke:#c2410c,stroke-width:2px,color:#7c2d12;

    Docs(("Architecture Knowledge Base"))
    Docs --> ADRs["ADRs"]
    Docs --> Patterns["Patterns"]
    Docs --> Templates["Templates"]
    Docs --> Standards["Standards"]
    Docs --> UsageGuides["Usage Guides"]
    Docs --> Generated["Generated Artifacts"]

    ADRs --> ADR1["ADR-001 Repository Pattern"]
    ADRs --> ADR2["ADR-002 Event-Driven Architecture"]
    ADRs --> ADR3["ADR-003 Error Handling Strategy"]
    ADRs --> ADR4["ADR-004 Frontend State Management"]
    ADRs --> ADR5["ADR-005 IPC Protocol"]
    ADRs --> ADR6["ADR-006 Standardized Cache Configuration"]

    Patterns --> PatternGuide["Development Patterns Guide"]
    Patterns --> ComponentProps["Component Props Standards"]
    Patterns --> SiteLoading["Site Loading & Monitoring"]
    Patterns --> InitImport["Initialization & Data Import"]
    Templates --> RepoTemplate["Repository Template"]
    Templates --> RepoTemplateClean["Repository Template (Clean)"]
    Templates --> StoreTemplate["Zustand Store Template"]
    Templates --> IPCTemplate["IPC Handler Template"]
    Standards --> TsdocStandards["TSDoc Standards"]
    UsageGuides --> QuickStart["Using This Documentation"]
    Generated --> IPCInventory["IPC Channel Inventory"]

    class Docs hub;
    class ADRs,Patterns,Templates,Standards,UsageGuides,Generated section;
    class ADR1,ADR2,ADR3,ADR4,ADR5,ADR6,PatternGuide,ComponentProps,SiteLoading,InitImport,RepoTemplate,RepoTemplateClean,StoreTemplate,IPCTemplate,TsdocStandards,QuickStart,IPCInventory file;
```

## 🏗️ Architecture Decision Records (ADRs)

ADRs document the key architectural decisions made during development, their context, consequences, and implementation guidelines.

### [ADR-001: Repository Pattern](./ADRs/ADR_001_REPOSITORY_PATTERN.md)

**Status: Accepted** - Establishes the repository pattern for all database access

- Dual method pattern (public async + internal sync)
- Transaction safety with `executeTransaction()`
- Consistent error handling and event emission
- All repositories follow this pattern: `SiteRepository`, `MonitorRepository`, `HistoryRepository`, `SettingsRepository`

### [ADR-002: Event-Driven Architecture](./ADRs/ADR_002_EVENT_DRIVEN_ARCHITECTURE.md)

**Status: Accepted** - Core communication mechanism using TypedEventBus

- Type-safe event system with compile-time checking
- Automatic metadata injection (correlation IDs, timestamps)
- Domain-based event naming (`domain:action`)
- IPC event forwarding for frontend integration

### [ADR-003: Error Handling Strategy](./ADRs/ADR_003_ERROR_HANDLING_STRATEGY.md)

**Status: Accepted** - Multi-layered error handling across all application layers

- Shared `withErrorHandling()` utility with frontend/backend overloads
- `withDatabaseOperation()` for retry logic and database operations
- Error preservation principles maintaining stack traces
- Safe store operations preventing cascading failures

### [ADR-004: Frontend State Management](./ADRs/ADR_004_FRONTEND_STATE_MANAGEMENT.md)

**Status: Accepted** - Zustand-based state management with modular composition

- Type-safe store interfaces with comprehensive TypeScript
- Modular composition for complex stores
- Selective persistence for user preferences
- Integration with error handling and IPC systems

### [ADR-005: IPC Communication Protocol](./ADRs/ADR_005_IPC_COMMUNICATION_PROTOCOL.md)

**Status: Accepted** - Standardized Electron IPC communication

- Centralized IPC service with domain-specific handlers
- Type-safe preload API with contextBridge isolation
- Consistent validation and error handling
- Event forwarding protocol for real-time updates

## 📋 Development Patterns

### [Development Patterns Guide](./Patterns/DEVELOPMENT_PATTERNS_GUIDE.md)

Comprehensive guide to all established patterns in the codebase:

- **Repository Pattern** - Database access with transaction safety
- **Event-Driven Communication** - TypedEventBus usage and event naming
- **Error Handling Patterns** - Multi-layered error handling strategies
- **Frontend State Management** - Zustand stores and modular composition
- **IPC Communication** - Electron IPC patterns and type safety
- **Testing Patterns** - Consistent testing approaches across layers

### [Component Props Standards](./Patterns/COMPONENT_PROPS_STANDARDS.md)

Detailed prop authoring standards for React components:

- **Interface Naming** - `Properties` suffix for all prop interfaces
- **Readonly Props** - Enforce immutability to avoid side effects
- **Event Handling** - Normalised handler signatures and accessibility defaults
- **Compliance Checklist** - Quick validation before code review

### [Site Loading & Monitoring Orchestration](./Patterns/SITE_LOADING_ORCHESTRATION.md)

End-to-end walkthrough of the main-process site loading pipeline:

- `DatabaseManager` startup and cache replacement flow
- `SiteLoadingOrchestrator` responsibilities and metrics
- Asynchronous `MonitoringConfig` guarantees (history limit, start/stop propagation)
- Renderer synchronization (`sites:state-synchronized`) and background hydration logic

### History limit propagation (settings & database)

This subsection summarizes how history limit changes flow through the system.
For full implementation details, see the code references listed in
`docs/Architecture/ADRs/ADR_002_EVENT_DRIVEN_ARCHITECTURE.md` and
`docs/Architecture/ADRs/ADR_004_FRONTEND_STATE_MANAGEMENT.md`.

**End-to-end flow**

1. **Renderer settings request**
   - The UI calls `SettingsService.updateHistoryLimit` in
     `src/services/SettingsService.ts`.
   - The service validates the requested limit with
     `normalizeHistoryLimit(DEFAULT_HISTORY_LIMIT_RULES)` and forwards the
     request over the typed IPC channel `"update-history-limit"` (via
     `SETTINGS_CHANNELS.updateHistoryLimit`).

2. **Main-process IPC handling**
   - `electron/services/ipc/IpcService.ts` registers the
     `SETTINGS_CHANNELS.updateHistoryLimit` handler through
     `registerStandardizedIpcHandler`, delegating to
     `DatabaseManager.setHistoryLimit` on the orchestrator.
   - The IPC handler uses the shared parameter validators in
     `electron/services/ipc/validators.ts` to enforce a numeric payload before
     invoking the manager.

3. **Database history limit update**
   - `electron/managers/DatabaseManager.ts` normalizes the limit using the
     shared history rules from `@shared/constants/history`.
   - The manager calls `setHistoryLimit` in
     `electron/utils/database/historyLimitManager.ts` to persist the new limit
     and prune history in a single transaction.
   - As soon as the limit has been normalized, the manager updates its
     in-memory `historyLimit` and calls `emitHistoryLimitUpdated` with the
     final value.

4. **Internal database event emission**
   - `emitHistoryLimitUpdated` emits the typed event
     `"internal:database:history-limit-updated"` via
     `TypedEventBus<UptimeEvents>`.
   - The event payload includes the new `limit`, the `operation`
     `"history-limit-updated"`, and a `timestamp`.

5. **HistoryLimitCoordinator forwarding**
   - `electron/coordinators/HistoryLimitCoordinator.ts` subscribes to
     `"internal:database:history-limit-updated"` on the orchestrator event
     bus.
   - It validates the new limit, tracks `previousLimit`, and forwards a
     sanitized `settings:history-limit-updated` event to renderer listeners
     using the shared `HistoryLimitUpdatedEventData` contract from
     `@shared/types/events` and `shared/ipc/rendererEvents.ts`.

6. **Preload bridge and renderer events**
   - `electron/preload/domains/eventsApi.ts` exposes the
     `settings:history-limit-updated` renderer channel and validates incoming
     payloads before forwarding them to `window.electronAPI.events`.
   - `src/services/EventsService.ts` provides
     `EventsService.onHistoryLimitUpdated`, wiring the preload contract into a
     typed renderer subscription with validated cleanup semantics.

7. **Renderer consumption**
   - The settings store (`src/stores/settings/useSettingsStore.ts`) and any
     interested components subscribe via `EventsService.onHistoryLimitUpdated`.
   - Store operations update local state based on the authoritative event
     payload, ensuring the renderer reflects the same limit as the backend and
     that future monitoring operations use the updated retention rules.

This flow keeps history-limit logic centralized in the database/manager layer
while providing a clear, event-driven path from a user action in the UI to the
final persisted configuration and back to the renderer.

### [Initialization & Data Import Orchestration](./Patterns/INITIALIZATION_AND_DATA_IMPORT_ORCHESTRATION.md)

Documents how `DatabaseManager`, `UptimeOrchestrator`, and the React `App`
coordinate:

- Startup phases across main and renderer processes
- `database:transaction-completed` event semantics and `operation` values
- JSON data import flows and related `internal:database:data-imported` events
- End-to-end site lifecycle flows for adding sites, adding monitors, and
  importing data

## 🛠️ Code Templates

Ready-to-use templates for implementing common patterns:

### [Repository Template](./Templates/REPOSITORY_TEMPLATE.md)

Complete template for creating new repository classes:

- Full TypeScript implementation with dual methods
- Query constants and dependency injection
- Comprehensive TSDoc documentation
- Test template and integration checklist

### [Zustand Store Template](./Templates/ZUSTAND_STORE_TEMPLATE.md)

Templates for both simple and complex Zustand stores:

- Simple store pattern for straightforward state
- Complex store with modular composition
- Module templates for focused functionality
- Testing patterns and error integration

### [IPC Handler Template](./Templates/IPC_HANDLER_TEMPLATE.md)

Complete IPC communication implementation:

- Handler registration with validation
- Preload API extensions
- Type definitions and error handling
- Test templates and naming conventions

## 📚 Documentation Standards

### [TSDoc Standards](./TSDOC_STANDARDS.md)

Standardized documentation patterns for inline code examples:

- Repository pattern documentation examples
- Event system documentation standards
- Frontend store documentation patterns
- Error handling documentation
- IPC communication documentation
- Code example categories and validation checklist

## 🧾 Generated Artifacts

### [IPC Channel Inventory](./generated/IPC_CHANNEL_INVENTORY.md)

Auto-generated reference documenting the authoritative list of IPC channels exposed via the preload bridge. Regenerate via `npm run generate:ipc` and keep this file in sync by running `npm run check:ipc` (also enforced in CI).

## 🎯 Using This Documentation

### For New Developers

1. **Start with ADRs** - Understand the architectural decisions and their context
2. **Read the Patterns Guide** - Learn the established patterns and conventions
3. **Use Templates** - Implement new features using the provided templates
4. **Follow TSDoc Standards** - Document your code using the established patterns

### For Existing Developers

1. **Reference ADRs** - When making architectural changes, consult existing decisions
2. **Update Patterns** - If you discover new patterns, document them in the guide
3. **Improve Templates** - Update templates based on learnings and improvements
4. **Maintain Standards** - Follow and improve the documentation standards

### For Code Reviews

1. **Check Pattern Compliance** - Ensure new code follows established patterns
2. **Verify Documentation** - Check that TSDoc follows the standards
3. **Validate Architecture** - Ensure changes align with ADR decisions
4. **Template Usage** - Verify that new repositories/stores/handlers use templates

## 🔄 Maintenance Guidelines

### When to Update ADRs

- **Status Changes** - Mark ADRs as superseded when patterns evolve
- **New Decisions** - Create new ADRs for significant architectural changes
- **Context Updates** - Update context and consequences as understanding improves

### Pattern Evolution

- **Document New Patterns** - Add emerging patterns to the guide
- **Update Templates** - Evolve templates based on best practices
- **Maintain Consistency** - Ensure all patterns work together harmoniously

### Documentation Quality

- **Regular Reviews** - Periodically review and update documentation
- **Example Accuracy** - Ensure code examples remain current and accurate
- **Cross-References** - Maintain links between related documents

### Automation & Review Cadence

- **Link Validation** - `npm run docs:check-links` verifies internal Markdown links and runs on every `lint:ci`
- **Quarterly Sync** - Architecture documentation reviewed during the first week of each quarter; action items tracked in `TODO.md`
- **CI Enforcement** - Documentation checks block merges alongside linting and IPC analysis to prevent drift

## 📊 Compliance Tracking

### Repository Pattern

- ✅ All database access uses repository pattern
- ✅ All repositories implement dual-method pattern
- ✅ All mutations use `executeTransaction()`
- ✅ All operations use `withDatabaseOperation()`

## Current Documentation Audit (2025-11-04)

- Verified directory listings against the live tree to ensure all paths, filenames, and cross-links (ADRs, patterns, templates, usage guides, generated artifacts) remain accurate.
- Click-tested intra-document links (mermaid references, pattern sections, and generated inventory) to confirm they resolve to existing files.
- Confirmed automation references (`npm run generate:ipc`, `npm run check:ipc`, `npm run docs:check-links`) still exist in `package.json` and CI scripts, ensuring the maintenance guidance is actionable.

### Event System

- ✅ All communication uses TypedEventBus
- ✅ All events follow naming conventions
- ✅ All events include proper metadata
- ✅ IPC events are automatically forwarded

### Error Handling

- ✅ All layers use appropriate error handling utilities
- ✅ All errors preserve original context
- ✅ All operations emit appropriate events
- ✅ Frontend stores use safe operations

### Frontend State

- ✅ All stores use TypeScript interfaces
- ✅ Complex stores use modular composition
- ✅ Persistence is selective and purposeful
- ✅ Actions include consistent logging

### IPC Communication

- ✅ All handlers use standardized registration
- ✅ All parameters are validated
- ✅ All channels follow naming conventions
- ✅ Preload API is type-safe

### State synchronization pipeline (sites & cache)

This subsection summarizes how site state synchronization works across main,
preload, and renderer. It complements the detailed mutation and lifecycle
guidance in `docs/TSDoc/stores/sites.md`.

**Main-process responsibilities**

1. **Authoritative state and events**
   - `SiteManager` maintains the canonical in-memory cache of `Site` entities
     and emits `sites:state-synchronized` events when bulk or targeted sync
     operations occur.
   - `UptimeOrchestrator` coordinates site and monitoring managers and
     forwards relevant events through its own typed event bus.

2. **IPC endpoints**
   - `electron/services/ipc/IpcService.ts` registers the typed
     state-synchronization handlers:
     - `STATE_SYNC_CHANNELS.requestFullSync` (`"request-full-sync"`) for
       explicit full resync requests.
     - `STATE_SYNC_CHANNELS.getSyncStatus` (`"get-sync-status"`) for
       lightweight status snapshots.
   - Both handlers use shared `StateSyncStatusSummary` and
     `StateSyncFullSyncResult` contracts from `@shared/types/stateSync`.

**Preload responsibilities**

3. **Validation and channel exposure**
   - `electron/preload/domains/eventsApi.ts` validates
     state-sync-related events using the `StateSyncEventData` guard from
     `@shared/types/events` before they reach renderer callbacks.
   - The preload layer exposes `stateSync` IPC methods and event hooks on
     `window.electronAPI.stateSync` according to the
     `StateSyncDomainBridge` mapping in `shared/types/preload.ts`.

**Renderer responsibilities**

4. **IPC abstraction**
   - `src/services/StateSyncService.ts` is the single renderer entrypoint for
     state-sync IPC:
     - `getSyncStatus()` wraps `stateSync.getSyncStatus()` and parses the
       result via `parseStateSyncStatusSummary`.
     - `requestFullSync()` wraps `stateSync.requestFullSync()` and parses the
       payload via `parseStateSyncFullSyncResult`.
     - `onStateSyncEvent()` subscribes to incremental state sync events,
       handling invalid payloads and coordinating automatic recovery via full
       sync when needed.

5. **Store coordination**
   - `src/stores/sites/useSiteSync.ts` composes the site sync actions on top
     of `StateSyncService` and the shared snapshot utilities:
     - `fullResyncSites()` coalesces concurrent resync requests, delegates to
       `syncSites()`, and logs pending/success/failure telemetry for
       diagnostics.
     - `syncSites()` always performs a backend `requestFullSync()`,
       normalizes the resulting snapshot with `deriveSiteSnapshot`, and
       replaces the local `sites` state in a single step.
     - `subscribeToSyncEvents()` wires `StateSyncService.onStateSyncEvent`
       into the store and uses `prepareSiteSyncSnapshot` plus
       `hasSiteSyncChanges` to derive incremental deltas without redundant
       store updates.
     - Status-update subscription helpers rely on `StatusUpdateManager` while
       keeping cache invalidations and state sync semantics aligned.

6. **Cache invalidation and debounce**
   - Cache invalidation events (`cache:invalidated`) act as **coarse-grained
     triggers** that tell the renderer “something changed” at the cache or
     database layer, but they do **not** carry the new site data themselves.
   - The site store uses a short debounce window so clustered invalidations
     (for example, during bulk imports or monitor lifecycle transitions) lead
     to a **single** resynchronization request rather than a cascade of
     redundant full-syncs.

7. **State-sync events as the payload carrier**
   - The actual site snapshots and deltas always flow through
     `sites:state-synchronized` events and the state-sync IPC surface
     (`STATE_SYNC_CHANNELS.requestFullSync` / `STATE_SYNC_CHANNELS.getSyncStatus`).
   - Renderer consumers combine these **fine-grained** state-sync payloads
     with the **coarse** `cache:invalidated` triggers: invalidations prompt a
     refresh, while state-sync events provide the authoritative data used to
     update local stores.

Together, these responsibilities ensure that the renderer's view of site data
remains consistent with the backend while preserving the event-driven,
debounced synchronization strategy defined in ADR-002 and ADR-004. Cache
events remain the wake-up signal, while state-sync events are the single
source of truth for what actually changed.

## 🚀 Quick Start

To implement a new feature:

1. **Identify the pattern** - Determine which architectural pattern applies
2. **Use the template** - Start with the appropriate template
3. **Follow the standards** - Use TSDoc standards for documentation
4. **Test thoroughly** - Use testing patterns from the guide
5. **Review compliance** - Ensure the implementation follows all relevant ADRs

## 📞 Support

For questions about architectural patterns or documentation:

1. **Check the ADRs** - Look for existing decisions
2. **Review the patterns guide** - Find established conventions
3. **Use the templates** - Adapt templates to your needs
4. **Follow the standards** - Use TSDoc standards for consistency

This documentation represents the living architectural knowledge of the Uptime-Watcher project. It should be updated as the architecture evolves and new patterns emerge.
