# Zustand Store Pattern Decision Guide

This guide helps developers choose the appropriate Zustand store pattern based on store complexity and requirements.

## Quick Decision Tree

```text
Is your store managing multiple domains/entities?
├── YES: Does it have >300 lines or complex interdependencies?
│   ├── YES → Use Modular Composition Pattern
│   └── NO → Consider Direct Create Pattern (evaluate below)
└── NO: Single domain/responsibility?
    └── YES → Use Direct Create Pattern
```

## Pattern Details

### Direct Create Pattern

**Best for:** Simple stores with single responsibility

**Characteristics:**

- Single domain/responsibility
- Typically <200 lines of code
- Straightforward state and actions
- Limited cross-cutting concerns
- Simple business logic

**Template:**

```typescript
export const useSimpleStore = create<SimpleStore>()((set, get) => ({
 // Initial state
 someValue: "",
 isLoading: false,

 // Actions
 setSomeValue: (value: string) => {
  logStoreAction("SimpleStore", "setSomeValue", { value });
  set({ someValue: value });
 },

 setLoading: (loading: boolean) => {
  logStoreAction("SimpleStore", "setLoading", { loading });
  set({ isLoading: loading });
 },
}));
```

### Modular Composition Pattern

**Best for:** Complex stores with multiple concerns

**Characteristics:**

- Multiple interconnected domains
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
- **Size**: ~127 lines
- **Justification**: Single responsibility (error handling), simple state

#### useUpdatesStore

- **Purpose**: Application update management
- **Size**: ~151 lines
- **Justification**: Single domain (updates), straightforward operations

#### useSettingsStore

- **Purpose**: Application settings persistence
- **Size**: ~385 lines
- **Justification**: Focused on settings domain, no complex interdependencies

#### useUIStore

- **Purpose**: UI state (modals, selections, preferences)
- **Justification**: Simple UI state management, single responsibility

#### useMonitorTypesStore

- **Purpose**: Monitor type configuration management
- **Size**: ~436 lines
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

- [ADR-004: Frontend State Management](../Architecture/ADRs/ADR-004-Frontend-State-Management.md)
- [UI Feature Development Guide](./UI-Feature-Development-Guide.md)
- [Zustand Store Template](../Architecture/Templates/Zustand-Store-Template.md)
