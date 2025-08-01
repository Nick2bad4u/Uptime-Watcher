# Function: getBaseMonitorTypes()

> **getBaseMonitorTypes**(): (`"http"` \| `"port"`)[]

Defined in: [electron/services/monitoring/monitorTypes.ts:40](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/monitoring/monitorTypes.ts#L40)

Get all base monitor types as an array.

## Returns

(`"http"` \| `"port"`)[]

Array containing only the built-in base monitor types

## Remarks

This function returns only the core base types (http, port) that are
built into the system. It does NOT include dynamically registered
monitor types from the registry.

## Example

```typescript
const baseTypes = getBaseMonitorTypes(); // ["http", "port"]
```

## See

MonitorTypeRegistry.getAllTypes for complete type list including dynamic types
