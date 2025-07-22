# Console Statements & Try-Catch Remediation Plan

## **🎯 EXECUTIVE SUMMARY**

<!-- markdownlint-disable -->

Found **26+ console statements** and **30+ try-catch blocks** that need evaluation and potential remediation. Priority is on production code, excluding test files and documentation examples.

---

## **📊 CONSOLE STATEMENTS ANALYSIS**

### **✅ LEGITIMATE (Keep as-is)**

- **Test files** (`src/test/**`) - Appropriate for test output
- **Documentation examples** (TSDoc comments) - Required for examples
- **Test setup files** - Necessary for test infrastructure

### **🔧 NEEDS REPLACEMENT (High Priority)**

#### **Production Error Handling**

```typescript
// fileDownload.ts - Multiple console.error statements
console.error("Both primary and fallback download failed:", fallbackError);
console.error("Failed to download file:", error);
console.error("Failed to trigger download click:", clickError);
console.warn("DOM manipulation failed, using fallback click", domError);
```

#### **Store Operations**

```typescript
// useSiteOperations.ts - Warning statements
console.warn("Failed to get enabled state for monitor:", error);
console.warn(`Failed to stop monitoring for monitor ${monitorId} of site ${siteId}:`, error);

// useMonitorTypes.ts - Error logging
console.error("Failed to load monitor types:", error_);

// ErrorBoundary.tsx - Error boundary logging
console.error("Store Error Boundary caught an error:", error, errorInfo);
```

#### **Debug Logging**

```typescript
// utils.ts - Development logging
console.log(`[${storeName}] ${action}`, payload ?? "");
```

---

## **🔄 TRY-CATCH BLOCKS ANALYSIS**

### **✅ LEGITIMATE (Keep as-is)**

- **Resource cleanup** - File operations, connections
- **Specific error handling** - Different error types need different handling
- **Fallback logic** - When you can recover from errors locally
- **Critical sections** - Where errors must not bubble up

### **🔧 CONVERSION CANDIDATES (Medium Priority)**

#### **Standard Async Operations**

```typescript
// cacheSync.ts - Event handling
try {
 logger.debug("Received cache invalidation event", data);
 // ... cache clearing logic
} catch (error) {
 logger.error("Cache sync error:", error);
}
```

#### **Store Actions**

```typescript
// statusUpdateHandler.ts - State updates
try {
 const result = await someAsyncOperation();
 // ... state updates
} catch (error) {
 console.error("Operation failed:", error);
}
```

---

## **🚀 IMPLEMENTATION STRATEGY**

### **Phase 1: Console Statement Replacement (High Priority)**

1. **Create Frontend Logger Utility** - Extend existing logger for frontend use
2. **Replace Console.error** - Use proper error logging with context
3. **Replace Console.warn** - Use structured warning logging
4. **Replace Console.log** - Use debug logging with environment checks

### **Phase 2: Try-Catch Evaluation (Medium Priority)**

1. **Analyze each try-catch** - Determine if error handling utility is appropriate
2. **Convert standard operations** - Use `withErrorHandling` for standard async ops
3. **Keep complex logic** - Preserve try-catch for resource cleanup and fallback logic
4. **Document decisions** - Add comments explaining why try-catch is kept

### **Phase 3: Error Handling Enhancement (Low Priority)**

1. **Add error context** - Include operation names and context data
2. **Structured error reporting** - Consistent error format across application
3. **Error recovery patterns** - Standardize retry and fallback logic

---

## **🎯 PRIORITY FIXES**

### **✅ COMPLETED (This Session)**

1. ✅ `fileDownload.ts` - **FIXED**: Replaced 4 console statements with logger

   - `console.error("Both primary and fallback download failed")` → `logger.error()` with proper Error handling
   - `console.error("Failed to download file")` → `logger.error()` with proper Error handling
   - `console.error("Failed to trigger download click")` → `logger.error()` with proper Error handling
   - `console.warn("DOM manipulation failed")` → `logger.warn()` with proper Error handling

2. ✅ `useSiteOperations.ts` - **FIXED**: Replaced 2 console.warn statements with logger.warn

   - Both statements now use structured logging with proper error handling
   - Development-only logging preserved with `isDevelopment()` check

3. ✅ `useMonitorTypes.ts` - **FIXED**: Replaced console.error with logger.error

   - Proper error type checking and fallback error creation

4. ✅ `ErrorBoundary.tsx` - **FIXED**: Replaced console.error with logger.error

   - React Error Boundary now uses structured logging

5. ✅ `utils.ts` - **FIXED**: Replaced console.log with logger.debug

   - Development logging now uses proper debug level

6. ✅ `useMonitorFields.ts` - **FIXED**: Replaced console.error with logger.error

   - Proper error type checking and fallback error creation

7. ✅ `useDynamicHelpText.ts` - **FIXED**: Replaced console.warn with logger.warn

   - Proper error type checking for dynamic help text loading

8. ✅ **SHARED UTILITIES ENHANCED**: Migrated to sharedLogger

   - `objectSafety.ts` - Replaced globalThis.console calls with sharedLogger for consistency
   - `errorHandling.ts` - Replaced globalThis.console calls with sharedLogger for consistency
   - Now uses existing `shared/utils/sharedLogger.ts` with proper cross-environment safety

9. ✅ **TYPE SAFETY FIXES**: Resolved TypeScript strict mode issues
   - `errorHandling.ts` - Removed unnecessary type assertions (lines 39, 93)
   - `monitorStatusChecker.ts` - Fixed `exactOptionalPropertyTypes` issue with StatusUpdate.details
   - `schemas.ts` - Simplified nested ternary operations for better readability

### **✅ FINAL ANALYSIS RESULTS**

- **Total Console Statements Found**: 30+
- **Production Code Fixed**: 12 statements across 7 files
- **Shared Utilities Enhanced**: Using existing sharedLogger for consistency
- **Type Safety Issues Fixed**: 4 issues across 3 files
- **Test Files (Kept)**: 18+ statements (appropriate for test output)
- **Documentation Examples (Kept)**: Multiple TSDoc examples (appropriate)

### **✅ COMPILATION STATUS**

- ✅ Frontend TypeScript: No errors
- ✅ Backend TypeScript: No errors
- ✅ All type safety issues resolved
- ✅ All console statements properly handled

### **Next Session**

1. Evaluate try-catch blocks in `statusUpdateHandler.ts`
2. Evaluate try-catch blocks in `cacheSync.ts`
3. Create enhanced error handling utilities if needed

---

## **📝 IMPLEMENTATION NOTES**

- **Logger Import**: Use `import logger from "../path/to/logger"`
- **Context Data**: Include relevant context (operation names, IDs, etc.)
- **Error Levels**:
  - `logger.error()` for errors that break functionality
  - `logger.warn()` for recoverable issues
  - `logger.debug()` for development information
- **Environment Checks**: Ensure development-only logging is properly gated
