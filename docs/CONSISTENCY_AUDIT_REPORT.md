# Codebase Consistency Audit Report

## Executive Summary

This report identifies critical consistency issues across the Uptime Watcher codebase that affect maintainability, type safety, and architectural coherence. The audit focused on structural patterns, data flow, logic uniformity, and interface consistency.

## 🚨 Critical Issues Found

### 1. **Type Definition Inconsistency** - HIGH PRIORITY

**Issue**: Frontend components use hardcoded status literals instead of importing shared types.

**Files Affected**:

- `src/theme/useTheme.ts` (line 247)
- `src/theme/components.tsx` (lines 59, 67)
- `src/hooks/site/useSiteMonitor.ts` (line 37)
- `src/components/common/StatusBadge.tsx` (line 21)
- `src/components/Dashboard/SiteCard/SiteCardStatus.tsx` (line 17)
- `src/stores/sites/utils/monitorOperations.ts` (line 52)

**Problem**:

```typescript
// ❌ Current (hardcoded)
status: "down" | "paused" | "pending" | "unknown" | "up";

// ✅ Should be (from shared types)
import type { MonitorStatus, SiteStatus } from "@shared/types";
status: MonitorStatus;
```

**Impact**: Type safety violations, potential runtime errors, maintenance overhead

---

### 2. **Validation Logic Duplication** - HIGH PRIORITY

**Issue**: Different validation approaches between frontend and backend.

**Frontend Pattern** (`src/stores/sites/utils/monitorOperations.ts`):

```typescript
export function validateMonitor(monitor: Partial<Monitor>): monitor is Monitor {
    return (
        typeof monitor.id === "string" &&
        typeof monitor.type === "string" &&
        typeof monitor.status === "string" &&
        ["down", "pending", "up"].includes(monitor.status) && // ❌ Hardcoded + incomplete
        // ... more basic checks
    );
}
```

**Backend Pattern** (`electron/services/monitoring/MonitorTypeRegistry.ts`):

```typescript
export function validateMonitorData(type: string, data: unknown) {
 // Uses Zod schemas with comprehensive validation
 const schema = VALIDATION_SCHEMAS[type];
 return schema.safeParse(data);
}
```

**Impact**: Inconsistent validation rules, potential data integrity issues

---

### 3. **Error Handling Pattern Inconsistency** - MEDIUM PRIORITY

**Frontend Pattern**:

```typescript
import { withErrorHandling } from "../stores/utils";
await withErrorHandling(operation, store);
```

**Backend Pattern**:

```typescript
import { withOperationalHooks } from "../utils/operationalHooks";
// OR direct logger calls
config.logger.error(`[operation] Failed`, error);
```

**Impact**: Inconsistent error reporting, debugging difficulties

---

### 4. **Re-export Pattern Issues** - MEDIUM PRIORITY

**Issue**: Inconsistent use of shared utilities across components.

**Current State**:

- `src/utils/siteStatus.ts` properly re-exports from shared
- Many components bypass this and import directly or use hardcoded values
- No barrel exports (index.ts files) despite test expectations

**Impact**: Import inconsistency, potential circular dependencies

---

## 🎯 Categorized Inconsistency Summary

### **Structural Consistency**

- ✅ **Database Layer**: Consistent transaction patterns with `*Internal` methods
- ✅ **Event System**: Unified TypedEventBus usage
- ❌ **Type Imports**: Mixed direct imports vs shared type usage
- ❌ **Validation**: Completely different approaches between frontend/backend

### **Data Flow Consistency**

- ✅ **Status Calculations**: Shared utilities properly implemented
- ❌ **Status Type Usage**: Hardcoded literals instead of shared types
- ✅ **IPC Communication**: Consistent preload/main process patterns

### **Logic Uniformity**

- ❌ **Monitor Validation**: Frontend uses basic checks, backend uses Zod
- ❌ **Error Handling**: Different patterns across layers
- ✅ **Monitor Type Registry**: Centralized and consistent

## 📋 Fix Implementation Plan

### **Phase 1: Type Safety** (IMMEDIATE)

1. Replace all hardcoded status literals with shared types
2. Update validation functions to use shared type guards
3. Ensure consistent import patterns

### **Phase 2: Validation Unification** (HIGH PRIORITY)

1. Create shared validation utilities
2. Extend backend Zod schemas to frontend
3. Remove duplicate validation logic

### **Phase 3: Error Handling Standardization** (MEDIUM PRIORITY)

1. Create shared error handling utilities
2. Standardize error patterns across frontend/backend
3. Improve error correlation and debugging

### **Phase 4: Architecture Cleanup** (LOW PRIORITY)

1. Add proper barrel exports where needed
2. Optimize import paths
3. Remove unused re-exports

## 🎯 Success Metrics

- **Type Safety**: 100% usage of shared types, no hardcoded literals
- **Validation**: Single source of truth for all validation rules
- **Error Handling**: Consistent error patterns across all layers
- **Import Consistency**: All shared utilities properly imported from shared directory

## Priority Order for Implementation

1. **CRITICAL**: Fix hardcoded status types (immediate type safety risk)
2. **HIGH**: Unify validation logic (data integrity risk)
3. **MEDIUM**: Standardize error handling (debugging/maintenance)
4. **LOW**: Clean up import patterns (code organization)
