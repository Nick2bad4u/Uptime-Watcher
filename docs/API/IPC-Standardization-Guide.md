# IPC Handler Standardization Implementation Guide

## Overview

Phase 3 of the consistency improvements has standardized all IPC handlers to use consistent patterns, response formats, and parameter validation. This document provides a comprehensive guide to the new standardized IPC architecture.

## Architecture Changes

### Standardized Response Format

All IPC handlers now return responses in the `IpcResponse<T>` format:

```typescript
interface IpcResponse<T> {
    success: boolean;      // Indicates operation success/failure
    data?: T;             // Response data when successful
    error?: string;       // Error message when operation fails
    metadata?: Record<string, unknown>;  // Additional operation metadata
    warnings?: string[];  // Non-critical warnings
}
```

### Handler Registration

All handlers are now registered using `registerStandardizedIpcHandler()`:

```typescript
registerStandardizedIpcHandler(
    "channel-name",                    // IPC channel name
    async (...args: unknown[]) => {   // Handler function
        // Implementation
    },
    validatorFunction,                 // Parameter validator
    registeredHandlers                 // Handler tracking set
);
```

## Handler Groups

### 1. Site Management Handlers

**Validators**: `SiteHandlerValidators`

- `add-site`: Adds a new site (validates Site object)
- `remove-site`: Removes a site (validates string identifier)
- `get-sites`: Retrieves all sites (no parameters)
- `update-site`: Updates site properties (validates identifier + updates object)
- `remove-monitor`: Removes a monitor (validates site identifier + monitor ID)

### 2. Monitoring Control Handlers

**Validators**: `MonitoringHandlerValidators`

- `start-monitoring`: Starts global monitoring (no parameters)
- `stop-monitoring`: Stops global monitoring (no parameters)
- `start-monitoring-for-site`: Starts monitoring for specific site (validates identifier + optional monitor ID)
- `stop-monitoring-for-site`: Stops monitoring for specific site (validates identifier + optional monitor ID)
- `check-site-now`: Triggers manual check (validates site identifier + monitor ID)

### 3. Data Management Handlers

**Validators**: `DataHandlerValidators`

- `export-data`: Exports application data (no parameters)
- `import-data`: Imports application data (validates data string)
- `update-history-limit`: Updates history retention limit (validates number)
- `get-history-limit`: Gets current history limit (no parameters)
- `download-sqlite-backup`: Downloads database backup (no parameters)

### 4. Monitor Type Handlers

**Validators**: `MonitorTypeHandlerValidators`

- `get-monitor-types`: Gets available monitor types (no parameters)
- `format-monitor-detail`: Formats monitor details (validates type + details string)
- `format-monitor-title-suffix`: Formats title suffix (validates type + monitor object)
- `validate-monitor-data`: Validates monitor configuration (validates type + data, returns special validation format)

### 5. State Sync Handlers

**Validators**: `StateSyncHandlerValidators`

- `request-full-sync`: Triggers full state synchronization (no parameters)
- `get-sync-status`: Gets current sync status (no parameters)

## Parameter Validation

### Built-in Validators

The `IpcValidators` utility provides common validation functions:

```typescript
// String validation
IpcValidators.requiredString(value, "paramName")
IpcValidators.optionalString(value, "paramName")

// Number validation
IpcValidators.requiredNumber(value, "paramName")

// Object validation
IpcValidators.requiredObject(value, "paramName")
```

### Custom Validators

Each handler group has specific validators in the `*HandlerValidators` objects:

```typescript
export const SiteHandlerValidators = {
    addSite: ((params: unknown[]): null | string[] => {
        // Validation logic
        return errors.length > 0 ? errors : null;
    }) satisfies IpcParameterValidator,
} as const;
```

## Error Handling

### Standardized Error Handling

All handlers use the `withIpcHandler` wrapper which provides:

- Automatic error catching and logging
- Consistent error response formatting
- Performance timing metadata
- Debug logging in development mode

### Error Response Format

Failed operations return:

```typescript
{
    success: false,
    error: "Error message",
    metadata: {
        handler: "channel-name",
        duration: 123
    }
}
```

## Migration from Legacy Handlers

### Before (Legacy Pattern)

```typescript
this.registeredIpcHandlers.add("add-site");
ipcMain.handle("add-site", async (_, site: Site) => {
    if (isDev()) logger.debug("[IpcService] Handling add-site");
    try {
        return this.uptimeOrchestrator.addSite(site);
    } catch (error) {
        logger.error("[IpcService] Failed to add site", error);
        throw error;
    }
});
```

### After (Standardized Pattern)

```typescript
registerStandardizedIpcHandler(
    "add-site",
    async (...args: unknown[]) => this.uptimeOrchestrator.addSite(args[0] as Site),
    SiteHandlerValidators.addSite,
    this.registeredIpcHandlers
);
```

## Frontend Integration

### Response Handling

All standardized IPC handlers now return the `IpcResponse<T>` format. Frontend code must be updated to handle this new response structure:

```typescript
// Updated approach - all handlers now use this format
const response = await window.electronAPI.sites.getSites();
if (response.success) {
    const sites = response.data;
    
    // Handle any warnings
    if (response.warnings?.length) {
        console.warn("Operation completed with warnings:", response.warnings);
    }
} else {
    console.error("Failed to get sites:", response.error);
    
    // Access additional error context
    if (response.metadata) {
        console.debug("Error metadata:", response.metadata);
    }
}
```

### Migration Considerations

**Breaking Change**: The standardization introduces a breaking change to the IPC response format. Frontend code needs to be updated to handle the new `IpcResponse<T>` structure.

**Migration Strategy**:
1. **Update Frontend Code**: Modify all IPC calls to handle the new response format
2. **Error Handling**: Take advantage of improved error information and metadata
3. **Testing**: Verify all IPC interactions work with the new format
3. Validation responses use the existing format for monitor validation

## Benefits Achieved

### 1. Consistency
- All 21 IPC handlers follow identical patterns
- Uniform error handling and logging
- Consistent response formats

### 2. Type Safety
- Parameter validation catches type errors before processing
- Strongly typed response interfaces
- Compile-time type checking for validators

### 3. Debugging & Monitoring
- Automatic performance timing for all handlers
- Consistent debug logging patterns
- Structured error reporting with metadata

### 4. Maintainability
- Centralized error handling logic
- Reusable validation utilities
- Clear separation of concerns

### 5. Reliability
- Parameter validation prevents runtime errors
- Standardized error recovery patterns
- Consistent fallback behaviors

## Usage Examples

### Adding a New IPC Handler

1. **Define the handler logic**:
```typescript
const newHandler = async (...args: unknown[]) => {
    const param1 = args[0] as ExpectedType;
    return await someOperation(param1);
};
```

2. **Create parameter validator**:
```typescript
const newValidator: IpcParameterValidator = (params: unknown[]): null | string[] => {
    const errors: string[] = [];
    
    if (params.length !== 1) {
        errors.push("Expected exactly 1 parameter");
    }
    
    const param1Error = IpcValidators.requiredString(params[0], "param1");
    if (param1Error) {
        errors.push(param1Error);
    }
    
    return errors.length > 0 ? errors : null;
};
```

3. **Register the handler**:
```typescript
registerStandardizedIpcHandler(
    "new-operation",
    newHandler,
    newValidator,
    this.registeredIpcHandlers
);
```

### Error Response Handling

```typescript
const response = await window.electronAPI.someOperation();

if (!response.success) {
    // Handle error
    console.error(`Operation failed: ${response.error}`);
    
    // Check for validation errors
    if (response.metadata?.validationErrors) {
        console.log("Validation errors:", response.metadata.validationErrors);
    }
    
    return;
}

// Handle success
const result = response.data;
console.log("Operation completed successfully:", result);

// Check for warnings
if (response.warnings?.length) {
    console.warn("Operation completed with warnings:", response.warnings);
}
```

## Testing the Implementation

All standardized handlers can be tested using the same pattern:

```typescript
// Test parameter validation
const invalidResponse = await window.electronAPI.someOperation(/* invalid params */);
expect(invalidResponse.success).toBe(false);
expect(invalidResponse.error).toContain("Parameter validation failed");

// Test successful operation
const validResponse = await window.electronAPI.someOperation(/* valid params */);
expect(validResponse.success).toBe(true);
expect(validResponse.data).toBeDefined();
```

## Conclusion

The standardized IPC architecture provides a robust, consistent, and maintainable foundation for all main-renderer communication. It ensures type safety, proper error handling, and consistent response formats across the entire application.

The implementation introduces a breaking change to the IPC response format, requiring frontend updates to handle the new `IpcResponse<T>` structure. However, this provides significant benefits in terms of error handling, debugging capabilities, and long-term maintainability. All 21 IPC handlers now follow identical patterns, making the codebase more predictable and easier to maintain.
