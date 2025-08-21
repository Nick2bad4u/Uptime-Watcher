# src/utils/fallbacks

Centralized fallback and default value utilities for robust error handling.

## Remarks

Provides type-safe fallback handling across the application with consistent
error handling, default value management, and UI state recovery patterns.
This module ensures the application remains functional even when expected
data is missing or invalid.

Key features:

- Type-safe null/undefined checking utilities
- Async error handling wrappers for React event handlers
- Consistent default value patterns for UI components
- Graceful degradation strategies for missing data
- Centralized fallback value definitions

## Example

```typescript
import {
    isNullOrUndefined,
    withAsyncErrorHandling,
    UiDefaults,
} from "./fallbacks";

// Safe null checking
if (isNullOrUndefined(userInput)) {
    return UiDefaults.EMPTY_STRING;
}

// Async event handler with error handling
const handleClick = withAsyncErrorHandling(
    async () => await saveData(),
    "saveData"
);

// Use default values for missing data
const displayName = siteName || UiDefaults.UNNAMED_SITE;
```

## Variables

- [UiDefaults](variables/UiDefaults.md)
- [MonitorDefaults](variables/MonitorDefaults.md)
- [SiteDefaults](variables/SiteDefaults.md)

## Functions

- [isNullOrUndefined](functions/isNullOrUndefined.md)
- [withAsyncErrorHandling](functions/withAsyncErrorHandling.md)
- [withSyncErrorHandling](functions/withSyncErrorHandling.md)
- [withFallback](functions/withFallback.md)
- [getMonitorDisplayIdentifier](functions/getMonitorDisplayIdentifier.md)
- [getMonitorTypeDisplayLabel](functions/getMonitorTypeDisplayLabel.md)
- [truncateForLogging](functions/truncateForLogging.md)
