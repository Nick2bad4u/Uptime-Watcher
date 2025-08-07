# ADR-004: Frontend State Management with Zustand

## Status

**Accepted** - Adopted across all frontend state management

## Context

The frontend needed a state management solution that would:

- Provide type safety for all state operations
- Enable modular, composable store architecture
- Support selective persistence of user preferences
- Integrate seamlessly with React components
- Avoid the complexity of Redux while maintaining predictable state updates

## Decision

We will use **Zustand** as our primary state management library with specific architectural patterns:

### 1. Modular Store Composition

Large stores are composed of smaller, focused modules to improve maintainability:

```typescript
// Main store composes multiple modules
export const useSitesStore = create<SitesStore>()((set, get) => {
 const stateActions = createSitesStateActions(set, get);
 const syncActions = createSiteSyncActions({
  getSites: () => get().sites,
  setSites: stateActions.setSites,
 });
 const operationsActions = createSiteOperationsActions({
  addSite: stateActions.addSite,
  getSites: () => get().sites,
  syncSitesFromBackend: syncActions.syncSitesFromBackend,
 });

 return {
  ...initialSitesState,
  ...stateActions,
  ...operationsActions,
  ...syncActions,
 };
});
```

### 2. Typed Store Interfaces

All stores use comprehensive TypeScript interfaces:

```typescript
export interface SitesStore extends SitesState {
 // State actions
 addSite: (site: Site) => void;
 setSites: (sites: Site[]) => void;
 removeSite: (identifier: string) => void;

 // Operations actions
 createSite: (siteData: CreateSiteData) => Promise<Site>;
 deleteSite: (identifier: string) => Promise<void>;

 // Sync actions
 syncSitesFromBackend: () => Promise<void>;
}
```

### 3. Consistent Action Logging

All store actions include consistent logging for debugging:

```typescript
setSelectedSite: (site: Site | undefined) => {
 logStoreAction("UIStore", "setSelectedSite", { site });
 set({ selectedSiteId: site ? site.identifier : undefined });
};
```

### 4. Selective Persistence

UI preferences are persisted while transient state remains in memory:

```typescript
export const useUIStore = create<UIStore>()(
 persist(
  (set) => ({
   // State and actions...
  }),
  {
   name: "uptime-watcher-ui",
   partialize: (state) => ({
    // Only persist user preferences
    showAdvancedMetrics: state.showAdvancedMetrics,
    siteDetailsChartTimeRange: state.siteDetailsChartTimeRange,
    // Exclude transient state
    // showSettings: false,
    // showSiteDetails: false,
   }),
  }
 )
);
```

### 5. Error Integration

Stores integrate with the error handling system:

```typescript
const performAction = async () => {
 await withErrorHandling(async () => {
  const result = await window.electronAPI.sites.addSite(data);
  addSite(result); // Update store state
  return result;
 }, errorStore);
};
```

## Store Categories

### 1. Domain Stores

Handle specific business domain state:

- `useSitesStore` - Site and monitor management
- `useMonitorTypesStore` - Monitor type configurations

### 2. UI Stores

Manage user interface state:

- `useUIStore` - Modal visibility, selected items, user preferences
- `useErrorStore` - Global error and loading states

### 3. System Stores

Handle application-level state:

- `useUpdatesStore` - Update management and notifications
- `useSettingsStore` - Application settings and configuration

## State Update Patterns

### 1. Immutable Updates

All state updates use immutable patterns:

```typescript
addSite: (site: Site) => {
 set((state) => ({
  sites: [...state.sites, site],
 }));
};
```

### 2. Async Operations

Async operations are handled in store actions:

```typescript
createSite: async (siteData: CreateSiteData) => {
 const result = await window.electronAPI.sites.addSite(siteData);
 get().addSite(result);
 return result;
};
```

### 3. Derived State

Complex derived state uses selectors:

```typescript
const sitesWithMonitorCount = useSitesStore((state) =>
 state.sites.map((site) => ({
  ...site,
  monitorCount: site.monitors.length,
 }))
);
```

## Integration with IPC

### Event-Driven Updates

Stores listen to IPC events for backend state synchronization:

```typescript
useEffect(() => {
 const cleanup = window.electronAPI.events.onStateSyncEvent((data) => {
  if (data.type === "sites-updated") {
   syncSitesFromBackend();
  }
 });
 return cleanup;
}, [syncSitesFromBackend]);
```

### Optimistic Updates

UI updates optimistically, with rollback on failure:

```typescript
deleteSite: async (identifier: string) => {
 // Optimistic update
 const originalSites = get().sites;
 removeSite(identifier);

 try {
  await window.electronAPI.sites.removeSite(identifier);
 } catch (error) {
  // Rollback on failure
  setSites(originalSites);
  throw error;
 }
};
```

## Testing Patterns

### Store Testing

Stores are tested with renderHook from @testing-library:

```typescript
describe("useSitesStore", () => {
 beforeEach(() => {
  const store = useSitesStore.getState();
  act(() => {
   store.setSites([]);
  });
 });

 it("should add site", () => {
  const { result } = renderHook(() => useSitesStore());

  act(() => {
   result.current.addSite(mockSite);
  });

  expect(result.current.sites).toContain(mockSite);
 });
});
```

## Consequences

### Positive

- **Type safety** - Compile-time checking prevents runtime errors
- **Modularity** - Large stores broken into focused, testable modules
- **Performance** - Efficient updates and selective subscriptions
- **Persistence** - User preferences maintained across sessions
- **Integration** - Seamless integration with error handling and IPC
- **Developer experience** - Simple API with powerful capabilities

### Negative

- **Learning curve** - Developers need to understand Zustand patterns
- **Boilerplate** - Module composition requires more initial setup
- **Complexity** - Async operations and error handling add complexity

## Implementation Guidelines

### 1. Store Structure

```typescript
// 1. Define interfaces
interface StoreState {
 /* state shape */
}
interface StoreActions {
 /* action signatures */
}
interface Store extends StoreState, StoreActions {}

// 2. Create store with composition
export const useStore = create<Store>()((set, get) => ({
 // Initial state
 ...initialState,

 // Actions
 action: (params) => {
  logStoreAction("StoreName", "action", { params });
  set((state) => ({
   /* immutable update */
  }));
 },
}));
```

### 2. Persistence Configuration

```typescript
persist(storeImplementation, {
 name: "unique-storage-key",
 partialize: (state) => ({
  // Only include persistent fields
 }),
});
```

### 3. Error Integration

Always wrap async operations with error handling utilities.

## Compliance

All frontend state follows these patterns:

- Type-safe store interfaces
- Consistent action logging
- Modular composition for complex stores
- Selective persistence for user preferences
- Integration with error handling system

## Related ADRs

- [ADR-003: Error Handling Strategy](./ADR-003-Error-Handling-Strategy.md)
- [ADR-005: IPC Communication Protocol](./ADR-005-IPC-Communication-Protocol.md)
