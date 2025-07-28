# Function: useBackendFocusSync()

> **useBackendFocusSync**(`enabled`): `void`

Defined in: [src/hooks/useBackendFocusSync.ts:36](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/hooks/useBackendFocusSync.ts#L36)

Hook for synchronizing data when the application window gains focus.
Provides functionality to automatically refresh data from the backend
when users return to the application after being away.

## Parameters

### enabled

`boolean` = `false`

boolean - Set to true to enable focus-based backend sync (default: false)

## Returns

`void`

void - This hook manages side effects only

## Remarks

Uses window focus events to trigger full backend synchronization when enabled.
Errors are handled internally by the store's error handling system through
withErrorHandling, so the fire-and-forget void pattern is safe here.

## Example

```tsx
function App() {
  const [syncOnFocus, setSyncOnFocus] = useState(true);

  // Enable automatic sync when user returns to app
  useBackendFocusSync(syncOnFocus);

  return <div>App content</div>;
}
```
