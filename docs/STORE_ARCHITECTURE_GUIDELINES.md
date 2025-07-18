<!-- markdownlint-disable -->

/\*\*

- Store Architecture Guidelines for Uptime Watcher
-
- This document outlines the standardized patterns for creating and organizing Zustand stores
- in the Uptime Watcher application. Follow these guidelines to ensure consistency and
- maintainability across the codebase.
  \*/

# Store Architecture Guidelines

## Architecture Decision

After analyzing the current codebase, we use **different patterns based on complexity**:

### 1. Modular Composition Pattern (Complex Stores)

**Use for stores with 15+ actions or complex domain logic**

- **Example**: Sites Store (20+ actions)
- **Structure**: Separate action modules composed into main store
- **Benefits**: Clear separation of concerns, easier testing, maintainable at scale

```typescript
// Main store file: useSitesStore.ts
export const useSitesStore = create<SitesStore>()((set, get) => {
    const stateActions = createSitesStateActions(set, get);
    const operationsActions = createSiteOperationsActions({...});
    const monitoringActions = createSiteMonitoringActions();
    const syncActions = createSiteSyncActions({...});

    return {
        ...initialState,
        ...stateActions,
        ...operationsActions,
        ...monitoringActions,
        ...syncActions,
    };
});

// Separate modules:
// - useSitesState.ts (core state management)
// - useSiteOperations.ts (CRUD operations)
// - useSiteMonitoring.ts (monitoring lifecycle)
// - useSiteSync.ts (backend synchronization)
```

### 2. Monolithic Pattern (Simple/Medium Stores)

**Use for stores with <15 actions or simple domain logic**

- **Examples**: Settings Store (5 actions), UI Store (8 actions), Error Store (8 actions)
- **Structure**: All actions and state in single file
- **Benefits**: Simple, direct, easy to understand for smaller stores

```typescript
// Single file: useSettingsStore.ts
export const useSettingsStore = create<SettingsStore>()(
 persist(
  (set, get) => ({
   // State
   settings: defaultSettings,

   // Actions
   initializeSettings: async () => {
    /* ... */
   },
   updateSettings: (newSettings) => {
    /* ... */
   },
   resetSettings: () => {
    /* ... */
   },
  }),
  persistConfig
 )
);
```

## Error Handling Standard

**All stores MUST use the centralized error store pattern**:

```typescript
// ✅ CORRECT - Use centralized error store
const errorStore = useErrorStore.getState();
await withErrorHandling(
    async () => {
        // Operation logic
    },
    {
        clearError: () => errorStore.clearStoreError("store-name"),
        setError: (error) => errorStore.setStoreError("store-name", error),
        setLoading: (loading) => errorStore.setOperationLoading("operationName", loading),
    }
);

// ❌ INCORRECT - Empty error handlers
{
    clearError: () => {},
    setError: (error) => logStoreAction("Store", "error", { error }),
    setLoading: () => {},
}
```

## Store Naming Conventions

### Store Names

- Use descriptive, domain-specific names
- Follow pattern: `use[Domain]Store` (e.g., `useSitesStore`, `useSettingsStore`)
- Avoid generic names like `useDataStore`, `useAppStore`

### Error Store Integration

- Use consistent store identifiers for error tracking:
  - `"sites-operations"` for Sites Store operations
  - `"sites-sync"` for Sites Store synchronization
  - `"settings"` for Settings Store
  - `"ui"` for UI Store (if needed)

### Operation Names

- Use descriptive operation names in `setOperationLoading`:
  - `"addMonitorToSite"`, `"createSite"`, `"syncSitesFromBackend"`
  - Avoid generic names like `"operation"`, `"update"`

## File Organization

### Modular Stores

```folder
src/stores/sites/
├── useSitesStore.ts          # Main store composition
├── types.ts                  # Store interfaces and types
├── useSitesState.ts         # Core state management
├── useSiteOperations.ts     # CRUD operations
├── useSiteMonitoring.ts     # Domain-specific actions
├── useSiteSync.ts           # Backend synchronization
├── services/                # Service layer abstractions
│   ├── SiteService.ts
│   └── MonitoringService.ts
└── utils/                   # Store-specific utilities
    ├── monitorOperations.ts
    └── statusUpdateHandler.ts
```

### Monolithic Stores

```folder
src/stores/settings/
├── useSettingsStore.ts      # Complete store implementation
└── types.ts                 # Store interfaces and types

src/stores/ui/
├── useUiStore.ts           # Complete store implementation
└── types.ts                # Store interfaces and types
```

## Implementation Guidelines

### When to Use Modular Pattern

- Store has 15+ actions
- Complex domain logic spanning multiple concerns
- Different action groups have different dependencies
- Need independent testing of action groups
- Store file would exceed 200-300 lines

### When to Use Monolithic Pattern

- Store has <15 actions
- Simple, focused domain
- All actions are closely related
- Store logic fits comfortably in single file (<200 lines)

### Error Handling Requirements

1. **Import error store**: Always import `useErrorStore` in files using `withErrorHandling`
2. **Use consistent store names**: Follow naming conventions for error tracking
3. **Specific operation names**: Use descriptive operation names for loading states
4. **No empty handlers**: Never use empty functions for error handling

### Type Safety

- Always define comprehensive interfaces in `types.ts`
- Use proper TypeScript for all store actions and state
- Export store types for component consumption
- Avoid `any` or `unknown` types

## Migration Guide

### Converting from Empty Error Handlers

```typescript
// Before (incorrect)
await withErrorHandling(
 async () => {
  /* operation */
 },
 {
  clearError: () => {},
  setError: (error) => logStoreAction("Store", "error", { error }),
  setLoading: () => {},
 }
);

// After (correct)
const errorStore = useErrorStore.getState();
await withErrorHandling(
 async () => {
  /* operation */
 },
 {
  clearError: () => errorStore.clearStoreError("store-domain"),
  setError: (error) => errorStore.setStoreError("store-domain", error),
  setLoading: (loading) => errorStore.setOperationLoading("operationName", loading),
 }
);
```

## Best Practices

1. **Consistency**: Follow the same pattern within each store type
2. **Documentation**: Document complex store logic with TSDoc comments
3. **Testing**: Write tests for store actions, especially in modular stores
4. **Performance**: Use `useCallback` and `useMemo` appropriately in components
5. **State Shape**: Keep state normalized and avoid deeply nested objects
6. **Actions**: Make actions atomic and focused on single responsibilities

## Examples

See existing implementations:

- **Modular**: `src/stores/sites/` (Sites Store)
- **Monolithic**: `src/stores/settings/` (Settings Store), `src/stores/ui/` (UI Store)
- **Error Handling**: `src/stores/error/` (Error Store)
