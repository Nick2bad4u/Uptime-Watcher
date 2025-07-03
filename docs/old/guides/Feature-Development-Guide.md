# 🚀 Feature Development Guide

<!-- markdownlint-disable -->

**Quick reference for adding new features to Uptime Watcher**

## 🎯 Core Requirements Checklist

### 1. **Architecture & Code Structure**

**Type Definitions:**

- ✅ Add interfaces to `src/types.ts` (frontend) and `electron/types.ts` (backend)
- ✅ Update `MonitorType` union type if adding new monitor types
- ✅ Ensure TypeScript strict mode compliance

**Monitor Services (if applicable):**

- ✅ Implement `IMonitorService` interface in `electron/services/monitoring/`
- ✅ Register new monitor in `MonitorFactory.ts`
- ✅ Add to `getAvailableTypes()` method

**Database Schema:**

- ✅ Update SQLite schema in `electron/services/database/`
- ✅ Add migration scripts for existing users
- ✅ Test migration paths thoroughly

### 2. **State Management**

**Zustand Store (`src/store.ts`):**

- ✅ Add state properties to `AppState` interface
- ✅ Implement actions following existing patterns
- ✅ Handle optimistic updates vs backend sync
- ✅ Add error handling for new operations

**Key Patterns:**

```typescript
// ✅ Optimistic updates with fallback
const newAction = async () => {
 set((state) => ({ optimisticChange: true }));
 try {
  await window.electronAPI.newOperation();
  await state.syncSitesFromBackend(); // Sync truth from backend
 } catch (error) {
  state.setError("Operation failed");
  await state.syncSitesFromBackend(); // Revert optimistic changes
 }
};
```

### 3. **IPC Communication**

**Electron API (`electron/preload.ts`):**

- ✅ Add new methods to `electronAPI` interface
- ✅ Validate inputs in main process handlers
- ✅ Return consistent response formats
- ✅ Handle async operations properly

**Security:**

- ✅ Input validation on all IPC boundaries
- ✅ No direct Node.js API exposure to renderer
- ✅ Use `contextIsolation: true`

### 4. **Logging & Monitoring**

**Backend Logging (`electron/utils/logger.ts`):**

```typescript
// ✅ Use structured logging
logger.info("New feature action", { featureId, params });
logger.error("Feature failed", error, { context });
```

**Frontend Logging (`src/utils/logger.ts`):**

```typescript
// ✅ Use appropriate log levels
logger.user.action("User triggered new feature");
logger.app.error("Frontend feature error", error);
```

**Performance Monitoring:**

- ✅ Add metrics to critical paths
- ✅ Monitor memory usage for new features
- ✅ Track response times for new operations

### 5. **UI Components & Integration**

**Component Structure:**

- ✅ Follow existing component patterns in `src/components/`
- ✅ Use ThemedText, ThemedButton, etc. for consistency
- ✅ Implement proper loading and error states
- ✅ Add accessibility attributes

**State Integration:**

```typescript
// ✅ Use store selectors for reactive data
const { newFeatureData, newFeatureAction } = useStore((state) => ({
 newFeatureData: state.newFeatureData,
 newFeatureAction: state.newFeatureAction,
}));
```

### 6. **Configuration & Settings**

**Constants (`src/constants.ts`):**

- ✅ Add feature-specific constraints and defaults
- ✅ Use TypeScript `as const` for type safety

**Settings Integration:**

- ✅ Add to `AppSettings` interface if user-configurable
- ✅ Include in settings persistence
- ✅ Add UI controls in Settings component

### 7. **Documentation**

**Required Updates:**

- ✅ API documentation (`docs/api/`)
- ✅ User guides (`docs/guides/`)
- ✅ Component documentation (`docs/component-docs/`)
- ✅ Update Feature Implementation Plan

**Critical:**

- ❌ **Never document features before implementation**
- ✅ **Always verify docs against actual code**

### 8. **Testing & Validation**

**Manual Testing:**

- ✅ Happy path scenarios
- ✅ Error conditions and edge cases
- ✅ UI responsiveness and loading states
- ✅ Data persistence across app restarts

**Integration Testing:**

- ✅ IPC communication works correctly
- ✅ Database operations don't corrupt data
- ✅ State management handles all scenarios
- ✅ Monitoring doesn't impact performance

### 9. **Error Handling**

**Comprehensive Error Handling:**

```typescript
// ✅ Backend services
try {
 const result = await newOperation();
 return result;
} catch (error) {
 logger.error("Operation failed", error, { context });
 throw new Error("User-friendly error message");
}

// ✅ Frontend components
const [error, setError] = useState<string | null>(null);

const handleAction = async () => {
 setError(null);
 try {
  await action();
 } catch (err) {
  setError(err instanceof Error ? err.message : "Unknown error");
 }
};
```

### 10. **Performance Considerations**

**Memory Management:**

- ✅ Clean up intervals/timers
- ✅ Remove event listeners
- ✅ Avoid memory leaks in monitoring loops

**Database Efficiency:**

- ✅ Use indexes for new query patterns
- ✅ Implement proper pagination
- ✅ Clean up old data periodically

## 🚨 Common Pitfalls to Avoid

### ❌ **State Management Issues**

- Don't mutate state directly (use Zustand patterns)
- Don't bypass store actions for data changes
- Don't forget to sync with backend after optimistic updates

### ❌ **Documentation Mismatches**

- Don't document features before implementing
- Don't forget to update API interfaces in docs
- Don't leave outdated examples in guides

### ❌ **TypeScript Problems**

- Don't use `any` types
- Don't ignore TypeScript errors
- Don't forget to update union types

### ❌ **IPC Security Issues**

- Don't expose Node.js APIs to renderer
- Don't skip input validation
- Don't trust frontend data in backend

### ❌ **Performance Problems**

- Don't create excessive re-renders
- Don't poll aggressively without need
- Don't ignore memory cleanup

## 📋 Development Workflow

1. **Plan & Design** - Review existing patterns, plan state changes
2. **Types First** - Define TypeScript interfaces
3. **Backend Implementation** - Services, IPC handlers, database
4. **Frontend Integration** - Store actions, UI components
5. **Error Handling** - Comprehensive error paths
6. **Testing** - Manual testing of all scenarios
7. **Documentation** - Update after implementation
8. **Performance Validation** - Check for regressions

## 🔧 Quick Reference Files

**Core Architecture:**

- `src/types.ts` - Frontend types
- `electron/types.ts` - Backend types
- `src/store.ts` - State management
- `electron/preload.ts` - IPC definitions

**Services:**

- `electron/services/monitoring/` - Monitor implementations
- `electron/services/database/` - Data persistence
- `electron/services/application/` - App lifecycle

**Utilities:**

- `src/utils/logger.ts` - Frontend logging
- `electron/utils/logger.ts` - Backend logging
- `src/constants.ts` - Configuration values

---

**Remember:** Every feature impacts multiple layers. Think through the full data flow from user action → frontend → IPC → backend → database → response → state update → UI refresh.
