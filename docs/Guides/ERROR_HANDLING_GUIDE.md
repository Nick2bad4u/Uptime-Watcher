---
schema: "../../config/schemas/doc-frontmatter.schema.json"
doc_title: "Error Handling Guide"
summary: "Comprehensive overview of error handling patterns, stores, and utilities in Uptime Watcher."
created: "2025-09-22"
last_reviewed: "2026-01-10"
doc_category: "guide"
author: "Nick2bad4u"
tags:
  - "uptime-watcher"
  - "error-handling"
  - "zustand"
  - "validation"
  - "testing"
---
# Error Handling Guide

## Overview

Comprehensive error handling patterns and practices in the Uptime Watcher application, covering centralized error management, TypedEventBus error propagation, and consistent error handling across frontend and backend systems.

## Current Error Handling Architecture

The application uses a **multi-layered error handling approach** with:

- **Centralized Error Store**: `useErrorStore` for global and store-specific error management
- **Shared Error Utilities**: `withErrorHandling()` for consistent async operation error handling
- **Event System Integration**: Error propagation through TypedEventBus
- **Type-Safe Error Conversion**: Enhanced error handling with type information
- **Operation-Specific Loading States**: Fine-grained loading feedback

### Error Model Overview

At a high level, error handling is layered as follows:

- \*\*Shared layer (`shared/**`)\*\*
  - Core primitives live in `shared/utils/errorHandling.ts`:
    - `ApplicationError` models domain-aware failures with metadata.
    - `withErrorHandling()` and `withUtilityErrorHandling()` wrap async
      operations with consistent logging, fallback, and propagation.
    - `ensureError()` / `convertError()` normalise unknown errors and
      preserve type information.
  - JSON and object safety helpers (`jsonSafety`, `objectSafety`) provide
    defensive parsing/iteration that callers can compose with the wrappers
    above.
- \*\*Backend/Electron layer (`electron/**`)\*\*
  - Services and repositories wrap long-running work with
    `withErrorHandling()` and `withDatabaseOperation()`, emitting typed
    events via `TypedEventBus` on failures.
  - IPC handlers rely on shared validation and surface sanitised error
    responses to the preload bridge.
- \*\*Renderer layer (`src/**`)\*\*
  - Zustand stores use `withErrorHandling()` together with
    `createStoreErrorHandler()` to wire loading/error state into
    `useErrorStore` while keeping store logic free of manual try/catch.
  - UI helpers in `src/utils/fallbacks.ts` (`withAsyncErrorHandling`,
    `withSyncErrorHandling`) provide lightweight wrappers for component event
    handlers that only need logging and a local fallback.
  - Components consume errors from stores and error boundaries instead of
    handling cross-cutting concerns themselves.

## Table of Contents

1. [Centralized Error Store](#centralized-error-store)
2. [Shared Error Handling Utilities](#shared-error-handling-utilities)
3. [Frontend Error Patterns](#frontend-error-patterns)
4. [Backend Error Patterns](#backend-error-patterns)
5. [Event System Error Handling](#event-system-error-handling)
6. [Component Error Boundaries](#component-error-boundaries)
7. [Validation Error Handling](#validation-error-handling)
8. [Testing Error Scenarios](#testing-error-scenarios)
9. [Best Practices](#best-practices)
10. [Summary](#summary)
11. [📚 Related Resources](#-related-resources)
12. [🎯 Quick Reference](#-quick-reference)

## Centralized Error Store

### Current Error Store Implementation

The `useErrorStore` provides centralized error management with support for:

```typescript
// Error store usage patterns
import { useErrorStore } from "../stores/error/useErrorStore";

// Basic global error management
const { setError, clearError, lastError, isLoading } = useErrorStore();

// Store-specific error isolation
const { setStoreError, clearStoreError, getStoreError } = useErrorStore();

// Operation-specific loading states
const { setOperationLoading, getOperationLoading } = useErrorStore();

// Example usage
import { SiteService } from "@app/services/SiteService";
import { SettingsService } from "@app/services/SettingsService";

const handleSiteCreation = async () => {
 const errorStore = useErrorStore.getState();

 try {
  errorStore.clearStoreError("sites");
  errorStore.setOperationLoading("createSite", true);

  const newSite = await SiteService.addSite(siteData);

  // Success - clear any previous errors
  errorStore.clearStoreError("sites");
 } catch (error) {
  // Error handling with store isolation
  const errorMessage = error instanceof Error ? error.message : "Unknown error";
  errorStore.setStoreError("sites", errorMessage);
 } finally {
  errorStore.setOperationLoading("createSite", false);
 }
};
```

### Store-Specific Error Management

```typescript
// Prevent error cross-contamination between different stores/domains
const handleMultipleOperations = async () => {
 const errorStore = useErrorStore.getState();

 try {
  // Site operation error won't affect settings operations
  await SiteService.addSite(siteData);
 } catch (error) {
  errorStore.setStoreError("sites", "Failed to create site");
  // Settings operations can still succeed
 }

 try {
  // Independent error handling
  await SettingsService.updateHistoryLimit(settings.historyLimit);
 } catch (error) {
  errorStore.setStoreError("settings", "Failed to update settings");
  // Sites operations remain unaffected
 }
};

// Component usage with store-specific errors
const MyComponent = () => {
 const sitesError = useErrorStore((state) => state.getStoreError("sites"));
 const settingsError = useErrorStore((state) =>
  state.getStoreError("settings")
 );

 return (
  <div>
   {sitesError && <ErrorAlert message={sitesError} domain="sites" />}
   {settingsError && <ErrorAlert message={settingsError} domain="settings" />}
  </div>
 );
};
```

### Error Store Interface

The error store provides the following state and actions:

```typescript
interface ErrorStore {
 // State
 isLoading: boolean;
 lastError: string | undefined;
 operationLoading: Record<string, boolean>;
 storeErrors: Record<string, string | undefined>;

 // Global error actions
 setError: (error: string | undefined) => void;
 clearError: () => void;
 setLoading: (loading: boolean) => void;

 // Store-specific error actions
 setStoreError: (store: string, error: string | undefined) => void;
 clearStoreError: (store: string) => void;
 getStoreError: (store: string) => string | undefined;

 // Operation-specific loading actions
 setOperationLoading: (operation: string, loading: boolean) => void;
 getOperationLoading: (operation: string) => boolean;

 // Clear all error states (but preserve loading states)
 clearAllErrors: () => void;
}
```

### Key Features

1. **Error Isolation**: Store-specific errors don't interfere with each other
2. **Operation Loading**: Fine-grained loading states for individual operations
3. **Selective Clearing**: `clearAllErrors()` clears only error states, preserving loading states
4. **Type Safety**: Full TypeScript support with proper error typing

## Shared Error Handling Utilities

### withErrorHandling() Utility

The `withErrorHandling` utility provides consistent error handling patterns with context-aware overloads for frontend and backend usage:

```typescript
import { withErrorHandling } from "@shared/utils/errorHandling";

// Frontend usage with store integration
const createSite = async (siteData: SiteData) => {
 const errorStore = useErrorStore.getState();

 return await withErrorHandling(
  async () => {
   const site = await SiteService.addSite(siteData);
   return site;
  },
  {
   clearError: () => errorStore.clearStoreError("sites"),
   setError: (error) => errorStore.setStoreError("sites", error),
   setLoading: (loading) =>
    errorStore.setOperationLoading("createSite", loading),
  }
 );
};

// Backend usage with logger integration
const processMonitorData = async (data: MonitorData) => {
 return await withErrorHandling(
  async () => {
   const result = await processData(data);
   return result;
  },
  {
   logger,
   operationName: "processMonitorData",
  }
 );
};
```

### Store Error Handler Factory

For consistent store error handling patterns, use the `createStoreErrorHandler` factory:

```typescript
import { createStoreErrorHandler } from "@app/stores/utils/storeErrorHandling";

// Simplified store error handling
await withErrorHandling(
 async () => {
  // Your async operation
  await SiteService.addSite(site);
 },
 createStoreErrorHandler("sites-operations", "createSite")
);
```

### withUtilityErrorHandling() Utility

For utility functions that need minimal error handling overhead:

```typescript
import { withUtilityErrorHandling } from "@shared/utils/errorHandling";

// Silent error handling with fallback
const parseJsonSafely = async (jsonString: string) => {
 return await withUtilityErrorHandling(
  async () => JSON.parse(jsonString),
  "parseJsonSafely",
  {}, // fallback value
  false // don't throw, return fallback
 );
};

// Error handling with throw
const criticalOperation = async () => {
 return await withUtilityErrorHandling(
  async () => performCriticalTask(),
  "criticalOperation",
  undefined,
  true // throw on error
 );
};
```

### Helper selection matrix

The table below summarizes which helper to use for common scenarios. This is a
convenience reference; see the sections above for detailed examples.

| Scenario                                                                | Recommended helper(s)                                  | Notes                                                                                 |
| ----------------------------------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| Async store operation with loading + error state (renderer)             | `withErrorHandling` + `createStoreErrorHandler`        | Preferred pattern for Zustand stores; wires into `useErrorStore` automatically.       |
| Shared or backend utility that needs a fallback value                   | `withUtilityErrorHandling`                             | Use when you want to return a fallback instead of throwing in non-critical utilities. |
| Backend/Electron service operation that logs errors and may rethrow     | `withErrorHandling` with `{ logger, operationName }`   | Centralizes logging and error propagation for services and IPC handlers.              |
| Simple React event handler that just needs logging (no store wiring)    | `withAsyncErrorHandling` from `src/utils/fallbacks.ts` | Wraps async callbacks to log failures without changing component error state.         |
| Synchronous operation that should never break the UI and has a fallback | `withSyncErrorHandling` from `src/utils/fallbacks.ts`  | Returns a fallback value on failure and logs with operation name.                     |
| One-off utility or script that must always surface failures             | `withUtilityErrorHandling` with `shouldThrow = true`   | Ensures failures are not silently swallowed; combine with logging as needed.          |

### Enhanced Error Conversion

The error handling utilities include enhanced error conversion with type information:

```typescript
import { convertError, ensureError } from "@shared/utils/errorHandling";

// Enhanced error conversion with type information
try {
 throw "string error";
} catch (error) {
 const converted = convertError(error);
 console.log(converted.error.message); // "string error"
 console.log(converted.originalType); // "string"
 console.log(converted.wasError); // false
}

// Simple error conversion
try {
 throw 404;
} catch (error) {
 const errorInstance = ensureError(error);
 console.log(errorInstance.message); // "404"
}
```

### Type-Safe Error Conversion

```typescript
import { ensureError, convertError } from "@shared/utils/errorHandling";

// Enhanced error handling with type information
const handleOperation = async () => {
 try {
  await riskyOperation();
 } catch (unknownError) {
  // Convert unknown error to typed Error
  const error = ensureError(unknownError);
  logger.error("Operation failed:", error);

  // Get detailed error information
  const {
   error: convertedError,
   originalType,
   wasError,
  } = convertError(unknownError);

  logger.debug("Error details:", {
   message: convertedError.message,
   originalType,
   wasError,
   stack: convertedError.stack,
  });

  throw error; // Re-throw after logging
 }
};
```

## Frontend Error Patterns

### Store Integration Pattern

```typescript
// Current pattern used in store modules
import { withErrorHandling } from "@shared/utils/errorHandling";
import { useErrorStore } from "../error/useErrorStore";

export const createSiteOperationsActions = (
 deps: SiteOperationsDependencies
) => ({
 createSite: async (siteData: SiteData) => {
  const errorStore = useErrorStore.getState();

  return await withErrorHandling(
   async () => {
    const site = await SiteService.addSite(siteData);
    await deps.syncSitesFromBackend();
    return site;
   },
   {
    clearError: () => errorStore.clearStoreError("sites-operations"),
    setError: (error) => errorStore.setStoreError("sites-operations", error),
    setLoading: (loading) =>
     errorStore.setOperationLoading("createSite", loading),
   }
  );
 },

 deleteSite: async (siteIdentifier: string) => {
  const errorStore = useErrorStore.getState();

  return await withErrorHandling(
   async () => {
    await SiteService.removeSite(siteIdentifier);
    deps.removeSite(siteIdentifier);
   },
   {
    clearError: () => errorStore.clearStoreError("sites-operations"),
    setError: (error) => errorStore.setStoreError("sites-operations", error),
    setLoading: (loading) =>
     errorStore.setOperationLoading("deleteSite", loading),
   }
  );
 },
});
```

### Component Error Handling

```typescript
// Error handling in React components
const MyComponent = () => {
 const [localError, setLocalError] = useState<string | null>(null);
 const globalError = useErrorStore((state) => state.lastError);
 const sitesError = useErrorStore((state) => state.getStoreError("sites"));
 const isLoading = useErrorStore((state) =>
  state.getOperationLoading("createSite")
 );

 const handleAction = useCallback(async () => {
  try {
   setLocalError(null); // Clear local error state
   await performAction();
  } catch (error) {
   // Handle component-specific errors locally
   const errorMessage =
    error instanceof Error ? error.message : "Unknown error";
   setLocalError(errorMessage);

   // Also log to centralized logger
   logger.error("Component action failed:", ensureError(error));
  }
 }, []);

 return (
  <div>
   {/* Display errors with priority: local > domain-specific > global */}
   {localError && <ErrorAlert message={localError} />}
   {!localError && sitesError && <ErrorAlert message={sitesError} />}
   {!localError && !sitesError && globalError && (
    <ErrorAlert message={globalError} />
   )}

   <button onClick={handleAction} disabled={isLoading}>
    {isLoading ? "Processing..." : "Perform Action"}
   </button>
  </div>
 );
};
```

## Backend Error Patterns

### Service Layer Error Handling

```typescript
// Backend service error handling
import { withErrorHandling } from "@shared/utils/errorHandling";
import { logger } from "../logger";

export class SiteService {
 async createSite(siteData: SiteData): Promise<Site> {
  return await withErrorHandling(
   async () => {
    // Validate input
    const validatedData = siteSchema.parse(siteData);

    // Perform database operation with transaction safety
    const site = await executeTransaction(async (db) => {
     const result = await this.siteRepository.create(validatedData, db);

     // Emit event for real-time updates
     await this.eventBus.emitTyped("site:added", {
      site: result,
      source: "user",
      timestamp: Date.now(),
     });

     return result;
    });

    return site;
   },
   {
    logger,
    operationName: "createSite",
   }
  );
 }

 async deleteSite(siteIdentifier: string): Promise<void> {
  return await withErrorHandling(
   async () => {
    // Validation
    if (!siteIdentifier || typeof siteIdentifier !== "string") {
     throw new Error("Invalid site identifier provided");
    }

    // Database operation
    await executeTransaction(async (db) => {
     const site = await this.siteRepository.findById(siteIdentifier, db);
     if (!site) {
      throw new Error(`Site not found: ${siteIdentifier}`);
     }

     await this.siteRepository.delete(siteIdentifier, db);

     // Emit event
     await this.eventBus.emitTyped("site:removed", {
      cascade: false,
      siteIdentifier,
      siteName: site.name,
      timestamp: Date.now(),
     });
    });
   },
   {
    logger,
    operationName: "deleteSite",
   }
  );
 }
}
```

### IPC Error Handling

```typescript
// IPC handler error handling (current pattern)
//
// registerStandardizedIpcHandler provides:
// - consistent error normalization + response formatting
// - correlation id extraction
// - optional parameter validation
// - duplicate handler registration protection
import type { IpcInvokeChannel } from "@shared/types/ipc";
import { SITES_CHANNELS } from "@shared/types/preload";

import type { UptimeOrchestrator } from "@electron/UptimeOrchestrator";

import { registerStandardizedIpcHandler } from "@electron/services/ipc/utils";
import { SiteHandlerValidators } from "@electron/services/ipc/validators/sites";
import { withIgnoredIpcEvent } from "@electron/services/ipc/handlers/handlerShared";

export const registerSitesHandlers = ({
 registeredHandlers,
 uptimeOrchestrator,
}: {
 registeredHandlers: Set<IpcInvokeChannel>;
 uptimeOrchestrator: UptimeOrchestrator;
}) => {
 registerStandardizedIpcHandler(
  SITES_CHANNELS.addSite,
  withIgnoredIpcEvent((site) => uptimeOrchestrator.addSite(site)),
  SiteHandlerValidators.addSite,
  registeredHandlers
 );
};
```

## Event System Error Handling

### TypedEventBus Error Propagation

```typescript
// Event system error handling
export class UptimeService {
 async processMonitorCheck(args: {
  monitor: Monitor;
  site: Site;
  siteIdentifier: string;
 }): Promise<void> {
  const { monitor, site, siteIdentifier } = args;
  try {
   const result = await this.performCheck(monitor);

   // Emit completion event (renderer-facing contract).
   await this.eventBus.emitTyped("monitor:check-completed", {
    checkType: "scheduled",
    monitorId: monitor.id,
    result: {
     ...result,
     monitor,
     site,
    },
    siteIdentifier,
    timestamp: Date.now(),
   });
  } catch (error) {
   const errorInfo = ensureError(error);

   // Log error
   logger.error("Monitor check failed:", errorInfo, {
    monitorId: monitor.id,
    siteIdentifier,
   });

   // Represent failures as a completed check whose StatusUpdate is
   // `down` with diagnostic details.
   await this.eventBus.emitTyped("monitor:check-completed", {
    checkType: "scheduled",
    monitorId: monitor.id,
    result: {
     details: errorInfo.message,
     monitorId: monitor.id,
     monitor,
     site,
     siteIdentifier,
     status: "down",
     timestamp: new Date().toISOString(),
    },
    siteIdentifier,
    timestamp: Date.now(),
   });
  }
 }
}

// Frontend event error handling
export const useMonitorEventIntegration = () => {
 const sitesStore = useSitesStore();
 const errorStore = useErrorStore();

 useEffect(() => {
  // Prefer subscribing via the SitesStore sync layer.
  // It encapsulates the underlying `EventsService` wiring and applies backend
  // updates consistently.
  const cleanup = sitesStore.subscribeToStatusUpdates((statusUpdate) => {
   if (statusUpdate.status === "down") {
    errorStore.setStoreError(
     "monitoring",
     `Monitor check failed for ${statusUpdate.siteIdentifier}: ${statusUpdate.details ?? "unknown error"}`
    );
   }
  });

  return () => {
   cleanup();
  };
 }, [sitesStore, errorStore]);
};
```

## Component Error Boundaries

### Current ErrorBoundary Implementation

```typescript
// Error boundary for React components
import { ErrorBoundary } from "../stores/error/ErrorBoundary";

// App-level error boundary
export const App = () => {
 return (
  <ErrorBoundary>
   <ThemeProvider>
    <MainContent />
   </ThemeProvider>
  </ErrorBoundary>
 );
};

// Component-specific error boundaries
export const SiteDetails = ({ siteIdentifier }: { siteIdentifier: string }) => {
 return (
  <ErrorBoundary
   fallback={<SiteDetailsErrorFallback siteIdentifier={siteIdentifier} />}
  >
   <SiteDetailsContent siteIdentifier={siteIdentifier} />
  </ErrorBoundary>
 );
};

// Error fallback components
const SiteDetailsErrorFallback = ({
 siteIdentifier,
}: {
 siteIdentifier: string;
}) => {
 const handleRetry = () => {
  window.location.reload();
 };

 return (
  <div className="error-fallback">
   <h2>Unable to load site details</h2>
   <p>An error occurred while loading details for site {siteIdentifier}</p>
   <button onClick={handleRetry}>Retry</button>
  </div>
 );
};
```

## Validation Error Handling

### Zod Schema Validation Errors

```typescript
// Validation error handling with Zod schemas
import { addSiteSchema } from "@shared/validation/schemas";

const handleFormSubmission = async (formData: FormData) => {
 try {
  // Validate with shared schema
  const validatedData = addSiteSchema.parse(formData);

  // Process valid data
  const site = await SiteService.addSite(validatedData);

  return { success: true, data: site };
 } catch (error) {
  if (error instanceof z.ZodError) {
   // Handle validation errors
   const fieldErrors = error.errors.reduce(
    (acc, err) => {
     const field = err.path.join(".");
     acc[field] = err.message;
     return acc;
    },
    {} as Record<string, string>
   );

   return {
    success: false,
    errors: fieldErrors,
    type: "validation",
   };
  }

  // Handle other errors
  const errorMessage = error instanceof Error ? error.message : "Unknown error";
  return {
   success: false,
   error: errorMessage,
   type: "operation",
  };
 }
};

// Real-time form validation
const useFormValidation = <T>(schema: z.ZodSchema<T>) => {
 const [errors, setErrors] = useState<Record<string, string>>({});

 const validateField = useCallback(
  (name: string, value: unknown) => {
   try {
    // Extract field schema for individual validation
    const fieldSchema = (schema as any).shape[name];
    if (fieldSchema) {
     fieldSchema.parse(value);

     // Clear error if validation passes
     setErrors((prev) => {
      const { [name]: _, ...rest } = prev;
      return rest;
     });
    }
   } catch (error) {
    if (error instanceof z.ZodError) {
     setErrors((prev) => ({
      ...prev,
      [name]: error.errors[0]?.message || "Invalid value",
     }));
    }
   }
  },
  [schema]
 );

 return { errors, validateField };
};
```

## Testing Error Scenarios

### Component Error Testing

```typescript
// Testing error handling in components
describe("Component Error Handling", () => {
 beforeEach(() => {
  vi.clearAllMocks();
 });

 it("handles API errors gracefully", async () => {
  const mockError = new Error("API connection failed");
  mockElectronAPI.sites.addSite.mockRejectedValueOnce(mockError);

  render(<AddSiteForm />);

  fireEvent.click(screen.getByRole("button", { name: /add site/i }));

  await waitFor(() => {
   expect(screen.getByText(/api connection failed/i)).toBeInTheDocument();
  });

  expect(logger.error).toHaveBeenCalledWith(
   expect.stringContaining("failed"),
   mockError
  );
 });

 it("recovers from errors correctly", async () => {
  const mockError = new Error("Temporary error");
  mockElectronAPI.sites.addSite
   .mockRejectedValueOnce(mockError)
   .mockResolvedValueOnce({ id: "1", name: "Test Site" });

  render(<AddSiteForm />);

  // First attempt fails
  fireEvent.click(screen.getByRole("button", { name: /add site/i }));
  await waitFor(() => {
   expect(screen.getByText(/temporary error/i)).toBeInTheDocument();
  });

  // Second attempt succeeds
  fireEvent.click(screen.getByRole("button", { name: /add site/i }));
  await waitFor(() => {
   expect(screen.queryByText(/temporary error/i)).not.toBeInTheDocument();
  });
 });
});
```

### Store Error Testing

```typescript
// Testing error handling in stores
describe("Store Error Handling", () => {
 it("isolates errors between operations", async () => {
  const { result } = renderHook(() => useErrorStore());

  act(() => {
   result.current.setStoreError("sites", "Sites error");
   result.current.setStoreError("settings", "Settings error");
  });

  expect(result.current.getStoreError("sites")).toBe("Sites error");
  expect(result.current.getStoreError("settings")).toBe("Settings error");

  act(() => {
   result.current.clearStoreError("sites");
  });

  expect(result.current.getStoreError("sites")).toBeUndefined();
  expect(result.current.getStoreError("settings")).toBe("Settings error");
 });
});
```

## Best Practices

### 1. Error Handling Hierarchy

- **Local Component Errors**: Handle UI-specific errors locally
- **Store-Specific Errors**: Use domain isolation for business logic errors
- **Global Errors**: Reserve for application-wide critical errors
- **Operation Errors**: Use operation-specific loading and error states

### 2. Consistent Error Patterns

```typescript
// ✅ Good: Consistent error handling
const handleOperation = async () => {
 return await withErrorHandling(
  async () => {
   const result = await performOperation();
   return result;
  },
  {
   clearError: () => errorStore.clearStoreError("domain"),
   setError: (error) => errorStore.setStoreError("domain", error),
   setLoading: (loading) =>
    errorStore.setOperationLoading("operation", loading),
  }
 );
};

// ❌ Bad: Inconsistent error handling
const handleOperation = async () => {
 try {
  setLoading(true);
  const result = await performOperation();
  setError(null);
  return result;
 } catch (error) {
  setError(error.message);
 } finally {
  setLoading(false);
 }
};
```

### 3. Error Logging Standards

```typescript
// ✅ Good: Comprehensive error logging
try {
 await riskyOperation();
} catch (error) {
 const errorInfo = ensureError(error);
 logger.error("Operation failed", errorInfo, {
  context: "additional context",
  userId: currentUser.id,
  operation: "operationName",
 });
 throw errorInfo; // Re-throw after logging
}

// ❌ Bad: Poor error logging
try {
 await riskyOperation();
} catch (error) {
 console.log("Error:", error);
 // Missing context, no re-throw
}
```

### 4. Error Recovery Patterns

```typescript
// ✅ Good: Error recovery with user actions
const RecoverableErrorComponent = ({
 error,
 onRetry,
}: {
 error: string;
 onRetry: () => void;
}) => {
 return (
  <div className="error-alert">
   <p>{error}</p>
   <button onClick={onRetry}>Try Again</button>
  </div>
 );
};

// ✅ Good: Graceful degradation
const FeatureComponent = () => {
 const [hasError, setHasError] = useState(false);

 if (hasError) {
  return <FallbackComponent />;
 }

 return <MainFeature onError={() => setHasError(true)} />;
};
```

### 5. Testing Error Scenarios

- **Test both success and error paths**
- **Verify error state management**
- **Test error recovery mechanisms**
- **Validate error logging calls**
- **Test error boundaries and fallbacks**

## Summary

The Uptime Watcher application implements a comprehensive, multi-layered error handling system that provides:

1. **Centralized Management**: Global error store with domain isolation
2. **Consistent Patterns**: Shared utilities for uniform error handling
3. **Type Safety**: Enhanced error conversion and type information
4. **Event Integration**: Error propagation through the TypedEventBus
5. **User Experience**: Graceful degradation and recovery mechanisms
6. **Developer Experience**: Comprehensive logging and debugging information

By following these patterns and practices, developers can ensure robust error handling that provides a dependable user experience while maintaining system reliability and debuggability.

## 📚 Related Resources

- [Event System Guide](./EVENT_SYSTEM_GUIDE.md) - TypedEventBus error propagation patterns
- [Zustand Store Pattern Guide](./ZUSTAND_STORE_PATTERN_GUIDE.md) - Store composition and error isolation
- [Testing Guide](./TESTING.md) - Error scenario testing approaches
- [Troubleshooting Guide](./TROUBLESHOOTING.md) - Error debugging and resolution
- [Architecture ADRs](../Architecture/ADRs/) - Error handling strategy decisions

## 🎯 Quick Reference

### Key Files

- `shared/utils/errorHandling.ts` - Core error handling utilities
- `src/stores/error/useErrorStore.ts` - Centralized error store
- `src/stores/utils/storeErrorHandling.ts` - Store error handler factory
- `shared/validation/schemas.ts` - Validation error handling
- `src/stores/error/ErrorBoundary.tsx` - React error boundaries

### Essential Imports

```typescript
// Core error handling
import {
 withErrorHandling,
 ensureError,
 convertError,
} from "@shared/utils/errorHandling";

// Store error management
import { useErrorStore } from "@app/stores/error/useErrorStore";
import { createStoreErrorHandler } from "@app/stores/utils/storeErrorHandling";

// Event system integration
import { EventsService } from "@app/services/EventsService";
```
