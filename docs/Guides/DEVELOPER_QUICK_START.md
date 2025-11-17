---
schema: "../../config/schemas/doc-frontmatter.schema.json"
title: "Developer Quick Start Guide"
summary: "Quick-start guide for setting up the Uptime Watcher development environment and understanding the architecture."
created: "2025-09-22"
last_reviewed: "2025-11-16"
category: "guide"
author: "Nick2bad4u"
tags:
  - "uptime-watcher"
  - "development"
  - "setup"
  - "quick-start"
  - "architecture"
---

# 🚀 Developer Quick Start Guide

## Table of Contents

1. [📋 Overview](#-overview)
2. [⚡ Quick Setup](#-quick-setup)
3. [🏗️ Architecture Quick Reference](#️-architecture-quick-reference)
4. [🔄 Data Flow Architecture](#-data-flow-architecture)
5. [🛠️ Common Development Tasks](#️-common-development-tasks)
6. [🔧 Available Scripts](#-available-scripts)
7. [🎯 Key Development Patterns](#-key-development-patterns)
8. [🚨 Important Guidelines](#-important-guidelines)
9. [🐛 Debugging](#-debugging)
10. [📚 Essential Documentation](#-essential-documentation)
11. [🎯 Next Steps](#-next-steps)

## 📋 Overview

Uptime Watcher is a sophisticated Electron desktop application for monitoring website uptime with real-time updates, comprehensive analytics, and desktop notifications.

## ⚡ Quick Setup

### Prerequisites

- **Node.js**: 24.8+ (required)
- **npm**: 11.5.2+ (comes with Node.js)
- **Git**: Latest version

### 1. Clone & Install

```bash
git clone https://github.com/Nick2bad4u/Uptime-Watcher.git
cd Uptime-Watcher
npm install
```

### 2. Start Development

```bash
# Start both Vite dev server and Electron (concurrently)
npm run electron-dev               # Append flags as needed: npm run electron-dev -- --log-debug

# Or start separately (two terminals recommended):
npm run dev           # Terminal 1: Vite dev server (port 5173)
npm run electron      # Terminal 2: Electron shell (waits for Vite)
```

### 3. Verify Setup

- Application window should open automatically
- React DevTools available in development
- Hot reload enabled for both frontend and backend changes

## 🏗️ Architecture Quick Reference

### Technology Stack

- **Frontend**: React + TypeScript + Tailwind CSS + Vite
- **Desktop**: Electron (main + renderer processes)
- **Database**: SQLite (node-sqlite3-wasm)
- **State**: Zustand (domain-specific stores with modular composition)
- **Testing**: Vitest (dual configuration)
- **IPC**: Type-safe Electron contextBridge with `registerStandardizedIpcHandler`

### Project Structure

```text
uptime-watcher/
├── electron/          # Main process (Node.js backend)
│   ├── main.ts       # Entry point
│   ├── services/     # Service-oriented architecture
│   │   ├── database/ # Repository pattern with executeTransaction()
│   │   ├── ipc/      # IPC handlers with registerStandardizedIpcHandler
│   │   └── monitoring/ # Monitoring services with TypedEventBus
│   └── managers/     # Business logic orchestrators
├── src/              # Renderer process (React frontend)
│   ├── components/   # React components
│   ├── stores/       # Zustand state management (modular composition)
│   └── services/     # Frontend services
├── shared/           # Common code (types, validation)
└── docs/             # Comprehensive documentation
```

## 🔄 Data Flow Architecture

### Core Data Patterns

The application follows a structured data flow pattern that ensures type safety and consistency:

```text
┌─────────────────────────┐
│   React Components      │ ← Consume state via Zustand stores
├─────────────────────────┤
│   Zustand Stores        │ ← Modular composition (state + operations + sync + monitoring)
│   (Modular Composition) │
├─────────────────────────┤
│   Renderer Services     │ ← `src/services/*` wrappers over contextBridge
│   (SiteService, etc.)   │
├─────────────────────────┤
│   IPC Service           │ ← registerStandardizedIpcHandler with validation
├─────────────────────────┤
│   Service Managers      │ ← Business logic orchestration
├─────────────────────────┤
│   TypedEventBus         │ ← Event-driven communication
├─────────────────────────┤
│   Repository Layer      │ ← executeTransaction() wrapper
├─────────────────────────┤
│   SQLite Database       │ ← node-sqlite3-wasm
└─────────────────────────┘
```

### Key Data Flow Principles

1. **Unidirectional Data Flow**: Data flows down from stores to components
2. **Event-Driven Updates**: Backend changes propagate via TypedEventBus events
3. **Optimistic Updates**: UI updates immediately, then syncs with backend
4. **Transaction Safety**: All database operations wrapped in executeTransaction()
5. **Type Safety**: Strict TypeScript with validation at IPC boundaries

## 🛠️ Common Development Tasks

### Adding a New Feature

1. **Backend**: Add service/repository in `electron/services/`
2. **IPC**: Create type-safe handlers using `registerStandardizedIpcHandler`
3. **Frontend**: Add components and modular store in `src/`
4. **Types**: Define shared types in `shared/types/`
5. **Tests**: Add tests in both `electron/test/` and `src/test/`

### Database Changes

1. **Repository**: Create/modify in `electron/services/database/`
2. **Manager**: Update business logic in `electron/managers/`
3. **Migration**: Handle schema changes in DatabaseService
4. **Types**: Update interfaces in `shared/types/`
5. **Events**: Emit appropriate events via TypedEventBus

### Frontend Changes

1. **Components**: Add to `src/components/`
2. **State**: Create/modify modular Zustand stores in `src/stores/`
3. **Styling**: Use Tailwind CSS classes
4. **IPC**: Communicate via renderer services under `src/services`
5. **Validation**: Use shared validation schemas from `shared/validation/`

## 🔧 Available Scripts

### Development

```bash
npm run electron-dev    # Start full development environment
npm run dev            # Vite dev server only
npm run electron       # Electron only (needs Vite running)
npm run build          # Production build
npm run dist           # Build and package application
```

### Testing

```bash
npm test               # Run all tests (Vitest)
npm run test:electron  # Backend tests only (Electron-focused Vitest config)
npm run test:frontend  # Frontend tests only (renderer Vitest config)
```

### Code Quality

```bash
npm run lint           # ESLint (JS/TS) with caching
npm run lint:css       # Stylelint for CSS/Tailwind layers (src/electron/shared/docs)
npm run lint:fix       # ESLint auto-fix pass
npm run lint:css:fix   # Stylelint auto-fix pass
npm run format         # Runs Prettier + Stylelint + ESLint + remark fixers
npm run check-types    # Full TypeScript project reference build
npm run docs:check-links # Validate documentation cross-links
```

### Documentation

```bash
npm run docs          # Generate TypeDoc documentation
npm run context       # Generate AI context (for AI assistants)
```

### IPC Automation

```bash
npm run generate:ipc  # Regenerate preload bridge typings + channel inventory
npm run check:ipc      # Ensure generated IPC artifacts are in sync with schemas
```

## 🎯 Key Development Patterns

### 1. Repository Pattern (Database)

All database operations use the repository pattern with transaction safety:

```typescript
// Always use repositories for database access with executeTransaction
class SiteRepository {
 async createSite(siteData: SiteCreationData): Promise<Site> {
  return await executeTransaction(this.db, async (tx) => {
   // All database operations within this block are transactional
   const site = await this.insertSite(tx, siteData);
   await this.insertMonitors(tx, site.id, siteData.monitors);
   return site;
  });
 }
}

// Usage in services
const sites = await siteRepository.findAll();
const newSite = await siteRepository.create(siteData);
```

### 2. IPC Communication with Validation

All IPC handlers use standardized registration with validation:

```typescript
// Backend: electron/services/ipc/IpcService.ts
registerStandardizedIpcHandler(
 "add-site",
 async (data: SiteCreationData) => {
  // Business logic handled by managers
  return await this.siteManager.createSite(data);
 },
 // Validation function ensures type safety
 (data): data is SiteCreationData =>
  typeof data === "object" &&
  typeof data.name === "string" &&
  Array.isArray(data.monitors)
);

import { SiteService } from "src/services/SiteService";

// Frontend: React components call the renderer services facade
const handleCreateSite = async (siteData: SiteCreationData) => {
 try {
  const result = await SiteService.addSite(siteData);
  console.log("Site created:", result);
 } catch (error) {
  console.error("Failed to create site:", error);
 }
};
```

### 3. Optimistic Manual Monitor Checks

Manual health checks resolve with enriched `StatusUpdate` payloads so the UI can update before the event bus broadcasts the completion event.

```typescript
// Renderer: src/stores/sites/useSiteMonitoring.ts
const { checkSiteNow } = createSiteMonitoringActions({
 applyStatusUpdate: applyStatusUpdateSnapshot,
 getSites: () => get().sites,
 monitoringService: MonitoringService,
 setSites: (sites) => set({ sites }),
});

await checkSiteNow(siteIdentifier, monitorId);
// The sites store updates immediately; follow-up events keep the UI in sync.
```

- Optimistic updates reuse `applyStatusUpdateSnapshot`, ensuring the same merge logic as the event-driven flow.
- Telemetry (`logStoreAction`) captures whether the optimistic payload was applied for observability.
- Subsequent `monitor:check-completed` or `monitor:status-changed` events reconcile the state and are idempotent.

### 4. Event-Driven Updates with TypedEventBus

Cross-service communication uses type-safe events:

```typescript
// Backend: Emit events for state changes
await this.eventBus.emitTyped("sites:added", {
 site: newSite,
 timestamp: Date.now(),
 correlationId: generateCorrelationId(),
});

import { EventsService } from "src/services/EventsService";

// Frontend: Listen for events via the renderer services facade
useEffect(() => {
 let unsubscribe: (() => void) | undefined;

 void (async () => {
  unsubscribe = await EventsService.onSiteAdded((data) => {
   // Type-safe event data
   sitesStore.addSite(data.site);
   showNotification(`Site ${data.site.name} added successfully`);
  });
 })();

 return () => {
  unsubscribe?.();
 };
}, []);
```

### 5. Modular Zustand Store Pattern

Complex stores use modular composition for maintainability:

```typescript
// Store composition with dependency injection
export const useSitesStore = create<SitesStore>()((set, get) => {
 // Create focused modules
 const stateActions = createSitesStateActions(set, get);
 const syncActions = createSiteSyncActions({
  getSites: () => get().sites,
  setSites: stateActions.setSites,
 });
 const operationsActions = createSiteOperationsActions({
  addSite: stateActions.addSite,
  removeSite: stateActions.removeSite,
  syncSites: syncActions.syncSites,
 });

 return {
  ...initialSitesState,
  ...stateActions, // Core state management
  ...operationsActions, // CRUD operations
  ...syncActions, // Backend synchronization
 };
});

// Usage in components
const { sites, addSite, startMonitoring } = useSitesStore();
```

### 6. Shared Validation Patterns

Use centralized validation for consistency:

```typescript
// Shared validation schemas (shared/validation/schemas.ts)
export const siteCreationSchema = z.object({
 name: z.string().min(1).max(100),
 url: z.string().url(),
 monitors: z.array(monitorSchema),
});

// Frontend validation
const validateSiteForm = (formData: FormData) => {
 const result = siteCreationSchema.safeParse(formData);
 if (!result.success) {
  return { isValid: false, errors: result.error.errors };
 }
 return { isValid: true, data: result.data };
};

// Backend validation (automatic via IPC handler validation)
registerStandardizedIpcHandler(
 "add-site",
 async (data: SiteCreationData) => {
  // Data is already validated by IPC layer
  return await this.siteManager.createSite(data);
 },
 (data): data is SiteCreationData => siteCreationSchema.safeParse(data).success
);
```

## 🚨 Important Guidelines

### DO's ✅

- **Follow TypeScript strict mode** - No `any` or type shortcuts
- **Use established patterns** - Repository, Service, IPC patterns
- **Write tests** - Both frontend and backend tests required
- **Document with TSDoc** - Follow established standards
- **Use error handling utilities** - `withErrorHandling()` for consistency

### DON'Ts ❌

- **No direct database access** - Always use repositories
- **No untyped IPC** - All communication must be typed
- **No global state** - Keep Zustand stores domain-specific
- **No direct state mutations** - Use store actions
- **No bypassing error handling** - Use established patterns

## 🐛 Debugging

### Development Tools

- **React DevTools**: Available in development mode
- **Electron DevTools**: F12 in the application window
- **VS Code Debugging**: Configured launch configurations available

### Common Issues

1. **SQLite WASM not found**: Run `npm run postbuild`
2. **IPC communication fails**: Check type definitions and handlers
3. **Hot reload not working**: Restart development server
4. **Database errors**: Check transaction safety and repository usage

### Logging

```bash
# Start Vite + Electron together and forward flags directly to Electron
npm run electron-dev -- --log-debug      # Verbose debug logs
npm run electron-dev -- --log-production # Production-style logging
npm run electron-dev -- --log-info       # Info-level logging

# Fallback: run processes manually if you need deeper customization
npm run dev
npm run electron -- --log-debug
```

## 📚 Essential Documentation

### Architecture Understanding

- [`docs/Guides/AI_CONTEXT.md`](./AI_CONTEXT.md) - AI assistant guide
- [`docs/Architecture/ADRs/`](../Architecture/ADRs/) - Architectural decisions
- [`docs/Architecture/Patterns/`](../Architecture/Patterns/) - Development patterns

### Implementation Guides

- [`docs/Guides/NEW_MONITOR_TYPE_IMPLEMENTATION.md`](./NEW_MONITOR_TYPE_IMPLEMENTATION.md)
- [`docs/Guides/UI_FEATURE_DEVELOPMENT_GUIDE.md`](./UI_FEATURE_DEVELOPMENT_GUIDE.md)
- [`docs/Architecture/Templates/`](../Architecture/Templates/) - Code templates

### Code Standards

- [`docs/TSDoc/`](../TSDoc/) - TSDoc documentation standards

## 🎯 Next Steps

### For New Contributors

1. **Read**: [`docs/Guides/AI_CONTEXT.md`](./AI_CONTEXT.md) for project understanding
2. **Explore**: Run the application and explore existing features
3. **Practice**: Try adding a simple feature following the patterns
4. **Ask**: Check documentation first, then ask questions

### For AI Assistants

1. **Context**: Load [`docs/Guides/AI_CONTEXT.md`](./AI_CONTEXT.md) for comprehensive context
2. **Patterns**: Reference [`docs/Architecture/`](../Architecture/) for coding patterns
3. **Examples**: Use templates in [`docs/Architecture/Templates/`](../Architecture/Templates/)

---

🎉 **Ready to contribute!** The codebase follows strict patterns and comprehensive documentation. When in doubt, check the existing code and documentation patterns.
