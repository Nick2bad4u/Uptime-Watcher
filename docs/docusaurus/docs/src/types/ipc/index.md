# src/types/ipc

IPC response type definitions and utilities for type-safe frontend-backend
communication.

## Remarks

This module provides TypeScript interfaces and utility functions that mirror
the backend IpcResponse interface, ensuring type safety across the Electron
IPC boundary. All standardized IPC handlers in the application return
responses in the defined format.

The module includes:

- Standardized response format interface
- Type guards for runtime type checking
- Data extraction utilities with error handling
- Safe fallback mechanisms for failed operations

These utilities are essential for maintaining type safety when communicating
between the renderer process (frontend) and main process (backend) in the
Electron application.

## Example

```typescript
// Type-safe IPC response handling
const response = await window.electronAPI.getSites();
if (isIpcResponse<Site[]>(response)) {
    const sites = extractIpcData<Site[]>(response);
    setSites(sites);
}

// Safe extraction with fallback
const sites = safeExtractIpcData(response, []);
```

## Interfaces

- [IpcResponse](interfaces/IpcResponse.md)

## Functions

- [isIpcResponse](functions/isIpcResponse.md)
- [extractIpcData](functions/extractIpcData.md)
- [safeExtractIpcData](functions/safeExtractIpcData.md)
