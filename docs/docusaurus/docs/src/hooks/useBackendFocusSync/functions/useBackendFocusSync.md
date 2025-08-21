# Function: useBackendFocusSync()

> **useBackendFocusSync**(`enabled`): `void`

Defined in: [src/hooks/useBackendFocusSync.ts:37](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/useBackendFocusSync.ts#L37)

Custom hook that synchronizes application data when the window gains focus.

## Parameters

### enabled

`boolean` = `false`

Boolean - Set to true to enable focus-based backend sync
  (default: false)

## Returns

`void`

Void - This hook manages side effects only

## Example

```tsx
function App() {
  const [syncOnFocus, setSyncOnFocus] = useState(true);

  // Enable automatic sync when user returns to app
  useBackendFocusSync(syncOnFocus);

  return <div>App content</div>;
}
```
