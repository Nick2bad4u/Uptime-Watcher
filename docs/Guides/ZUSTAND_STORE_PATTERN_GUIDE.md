---
ai_note: "Updated by AI on 2025-11-15 to add metadata."
summary: "Decision guide for choosing between direct create and modular composition patterns for Zustand stores in Uptime Watcher."
creation_date: "unknown"
last_modified_date: "2025-11-15"
author: "Nick2bad4u"
title: "Zustand Store Pattern Decision Guide"
description: "Explains when to use simple direct stores versus modular composition, with real examples, anti-patterns, and best practices for store organization."
category: "guide"
keywords:
  - "uptime-watcher"
  - "zustand"
  - "state-management"
  - "patterns"
  - "stores"
misc:
  doc_category: "Guides"
  source: "Uptime-Watcher docs"
---

# Zustand Store Pattern Decision Guide

This guide helps developers choose the appropriate Zustand store pattern based on store complexity and requirements, reflecting the current modular composition architecture.

## Quick Decision Tree

```text
Is your store managing multiple domains/entities?

 > **Why the helper?** `applySavedSiteToStore` enforces identifier uniqueness before
 > committing state changes. Combined with sync-side duplicate detection, this
 > prevents backend race conditions from silently introducing duplicated sites
 > while still surfacing anomalies through structured logging.
├── YES: Does it have >200 lines, multiple concerns, or complex interdependencies?
│   ├── YES → Use Modular Composition Pattern (RECOMMENDED)
│   └── NO → Consider Direct Create Pattern (evaluate below)
└── NO: Single domain/responsibility?
    └── YES → Use Direct Create Pattern
```

## Current Architecture Patterns

### Modular Composition Pattern (RECOMMENDED)

**Best for:** Complex stores with multiple responsibilities and cross-cutting concerns

**Real Implementation Example - Sites Store:**

```typescript
// Main store file: useSitesStore.ts
export const useSitesStore = create<SitesStore>()((set, get) => {
 // Create state actions
 const stateActions = createSitesStateActions(set, get);

 // Shared helper function - eliminates duplication
 const getSites = (): Site[] => get().sites;

 // Create sync actions (needed by other modules)
 const syncActions = createSiteSyncActions({
  getSites,
  setSites: stateActions.setSites,
 });

 // Create monitoring actions
 const monitoringActions = createSiteMonitoringActions();

 // Create operations actions with dependencies
 const operationsActions = createSiteOperationsActions({
  addSite: stateActions.addSite,
  getSites,
  removeSite: stateActions.removeSite,
  setSites: stateActions.setSites,
  syncSites: syncActions.syncSites,
 });

 return {
  // Initial state
  ...initialSitesState,

  // Composed modules
  ...stateActions, // Core state management
  ...operationsActions, // CRUD operations
  ...monitoringActions, // Monitoring lifecycle
  ...syncActions, // Backend synchronization
 };
});
```

**Module Structure Example:**

```typescript
// useSitesState.ts - Core state management
export const createSitesStateActions = (set, get) => ({
 setSites: (sites: Site[]) => {
  logStoreAction("SitesStore", "setSites", { count: sites.length });
  set({ sites });
 },

 addSite: (site: Site) => {
  logStoreAction("SitesStore", "addSite", { siteIdentifier: site.id });
  set((state) => ({ sites: [...state.sites, site] }));
 },

 removeSite: (siteIdentifier: string) => {
  logStoreAction("SitesStore", "removeSite", { siteIdentifier });
  set((state) => ({
   sites: state.sites.filter((s) => s.id !== siteIdentifier),
  }));
 },
});

// useSiteOperations.ts - CRUD operations with IPC
import { SiteService } from "src/services/SiteService";

export const createSiteOperationsActions = (deps) => ({
 createSite: async (siteData: SiteCreationData): Promise<Site> => {
  logStoreAction("SitesStore", "createSite", { name: siteData.name });

  try {
   const savedSite = await SiteService.addSite(siteData);
   applySavedSiteToStore(savedSite, deps); // Replaces existing snapshot safely
   return savedSite;
  } catch (error) {
   console.error("Failed to create site:", error);
   throw error;
  }
 },

 deleteSite: async (siteIdentifier: string): Promise<void> => {
  logStoreAction("SitesStore", "deleteSite", { siteIdentifier });

  try {
   await SiteService.removeSite(siteIdentifier);
   deps.removeSite(siteIdentifier);
  } catch (error) {
   console.error("Failed to delete site:", error);
   throw error;
  }
 },
});

// useSiteSync.ts - Backend synchronization
import { StateSyncService } from "src/services/StateSyncService";

export const createSiteSyncActions = (deps) => ({
 syncSites: async (): Promise<void> => {
  logStoreAction("SitesStore", "syncSites", {});

  try {
   const { sites } = await StateSyncService.requestFullSync();
   deps.setSites(sites);
  } catch (error) {
   console.error("Failed to sync sites:", error);
   throw error;
  }
 },

 handleStateSyncEvent: (event: StateSyncEventData) => {
  if (event.action === "bulk-sync" || event.action === "update") {
   deps.setSites(event.sites);
  }
 },
});
```

**Benefits of Modular Composition:**

- ✅ **Clear Separation of Concerns**: Each module has a focused responsibility
- ✅ **Dependency Injection**: Modules receive only what they need
- ✅ **Independent Testing**: Each module can be tested in isolation
- ✅ **Reusability**: Modules can be shared across similar stores
- ✅ **Maintainability**: Changes are localized to specific modules
- ✅ **Type Safety**: Full TypeScript support with interface composition

### Direct Create Pattern

**Best for:** Simple stores with single responsibility and minimal complexity

**Real Implementation Example - UI Store:**

```typescript
// Direct pattern for simple state management
export const useUIStore = create<UIStore>()((set, get) => ({
 // Initial state
 sidebarOpen: false,
 theme: "light",
 isLoading: false,
 notifications: [],

 // Simple actions
 toggleSidebar: () => {
  logStoreAction("UIStore", "toggleSidebar", {});
  set((state) => ({ sidebarOpen: !state.sidebarOpen }));
 },

 setTheme: (theme: "light" | "dark") => {
  logStoreAction("UIStore", "setTheme", { theme });
  set({ theme });
 },

 setLoading: (isLoading: boolean) => {
  logStoreAction("UIStore", "setLoading", { isLoading });
  set({ isLoading });
 },

 addNotification: (notification: Notification) => {
  logStoreAction("UIStore", "addNotification", { type: notification.type });
  set((state) => ({
   notifications: [...state.notifications, notification],
  }));
 },

 removeNotification: (id: string) => {
  logStoreAction("UIStore", "removeNotification", { id });
  set((state) => ({
   notifications: state.notifications.filter((n) => n.id !== id),
  }));
 },
}));
```

**Characteristics of Direct Pattern:**

- Single domain/responsibility
- Typically <150 lines of code
- Straightforward state and actions
- Limited cross-cutting concerns
- Simple business logic
- No complex interdependencies

**When to Use Direct Pattern:**

- ✅ UI state management (themes, modals, loading states)
- ✅ Simple settings or preferences
- ✅ Notification/alert management
- ✅ Form state for individual components
- ✅ Cache stores with simple operations

## Data Flow Integration

### Event-Driven Store Updates

Both patterns integrate with the TypedEventBus for real-time updates:

```typescript
// Event listener setup (usually in root component)
import { EventsService } from "src/services/EventsService";

export const useStoreEventListeners = () => {
 const sitesStore = useSitesStore();
 const settingsStore = useSettingsStore();

 useEffect(() => {
  let cleanupFunctions: Array<() => void> = [];

  void (async () => {
   cleanupFunctions = await Promise.all([
    // Sites events
    EventsService.onSiteAdded((data) => {
     sitesStore.handleSiteAdded(data.site);
    }),
    EventsService.onSiteRemoved((data) => {
     sitesStore.handleSiteDeleted(data.siteIdentifier);
    }),
    EventsService.onSiteUpdated((data) => {
     sitesStore.handleSiteUpdated(data.site);
    }),
   ]);
  })();

  return () => {
   cleanupFunctions.forEach((cleanup) => {
    cleanup?.();
   });
  };
 }, []);
};
```

### State Persistence Patterns

```typescript
// Selective persistence for appropriate stores
export const useUIStore = create<UIStore>()(
 persist(
  (set, get) => ({
   // Store implementation
  }),
  {
   name: "ui-store",
   partialize: (state) => ({
    theme: state.theme,
    sidebarOpen: state.sidebarOpen,
    // Don't persist notifications or loading states
   }),
  }
 )
);
```

- Typically >300 lines of code
- Complex business logic
- Requires dependency injection between modules
- Benefits from separation of concerns

**Template:**

```typescript
export const useComplexStore = create<ComplexStore>()((set, get) => {
 // Create modular actions
 const stateActions = createStateActions(set, get);
 const operationsActions = createOperationsActions({
  // Dependencies from other modules
  getSomeData: () => get().someData,
  setSomeData: stateActions.setSomeData,
 });
 const syncActions = createSyncActions({
  // Dependencies
 });

 return {
  // Initial state
  ...initialState,

  // Composed modules
  ...stateActions,
  ...operationsActions,
  ...syncActions,
 };
});
```

## Current Store Examples

### Direct Create Pattern Examples

#### useErrorStore

- **Purpose**: Global error state management
- **Size**: \~127 lines
- **Justification**: Single responsibility (error handling), simple state

#### useUpdatesStore

- **Purpose**: Application update management
- **Size**: \~151 lines
- **Justification**: Single domain (updates), straightforward operations

#### useSettingsStore

- **Purpose**: Application settings persistence
- **Size**: \~385 lines
- **Justification**: Focused on settings domain, no complex interdependencies

#### useUIStore

- **Purpose**: UI state (modals, selections, preferences)
- **Justification**: Simple UI state management, single responsibility

#### useMonitorTypesStore

- **Purpose**: Monitor type configuration management
- **Size**: \~436 lines
- **Justification**: Focused domain, limited cross-cutting concerns

### Modular Composition Pattern Examples

#### useSitesStore

- **Purpose**: Site and monitor management
- **Size**: Large (distributed across modules)
- **Justification**: Multiple domains (sites, monitors, history, sync), complex operations, extensive business logic
- **Modules**:
  - `useSitesState` - Basic state management
  - `useSiteOperations` - CRUD operations
  - `useSiteSync` - Backend synchronization
  - `useSiteMonitoring` - Monitoring operations

## Migration Guidelines

### When to Refactor from Direct to Modular

Consider migrating when a direct create store:

- Exceeds 300 lines
- Starts managing multiple domains
- Develops complex interdependencies
- Becomes difficult to test or maintain

### When to Keep Direct Pattern

Keep the direct pattern when:

- Store remains focused on single responsibility
- Logic is straightforward
- No complex business rules
- Easy to understand and maintain

## Best Practices

### For Direct Create Pattern

- Keep actions simple and focused
- Use meaningful action names
- Include consistent logging
- Maintain type safety
- Document complex logic

### For Modular Composition Pattern

- Separate concerns into logical modules
- Use dependency injection between modules
- Maintain clear interfaces between modules
- Test modules independently
- Document module responsibilities

## Anti-Patterns to Avoid

### ❌ Don't: Mix patterns inconsistently

```typescript
// Bad: Inconsistent mixing of patterns
const useStore = create((set) => {
 const someModule = createSomeModule(set); // Modular
 return {
  // Direct actions mixed with modules
  directAction: () => set({ value: 1 }),
  ...someModule,
 };
});
```

### ❌ Don't: Over-engineer simple stores

```typescript
// Bad: Unnecessary modular composition for simple store
const useSimpleStore = create((set, get) => {
 const stateActions = createStateActions(set); // Overkill for simple state
 return { ...stateActions };
});
```

### ❌ Don't: Create monolithic direct stores

```typescript
// Bad: 500+ line direct create store managing multiple domains
const useMonolithicStore = create((set) => ({
 // Too many responsibilities in one store
 sites: [],
 monitors: [],
 settings: {},
 ui: {},
 // ... hundreds of lines of actions
}));
```

## Related Documentation

- [ADR-004: Frontend State Management](../Architecture/ADRs/ADR_004_FRONTEND_STATE_MANAGEMENT.md)
- [UI Feature Development Guide](./UI_FEATURE_DEVELOPMENT_GUIDE.md)
- [Developer Quick Start Guide](./DEVELOPER_QUICK_START.md)
- [API Documentation](./API_DOCUMENTATION.md)
