# Function: getBaseMonitorTypes()

> **getBaseMonitorTypes**(): (`"http"` \| `"port"` \| `"ping"` \| `"dns"`)[]

Defined in: [electron/services/monitoring/monitorTypes.ts:40](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/monitorTypes.ts#L40)

Get all base monitor types as an array.

## Returns

(`"http"` \| `"port"` \| `"ping"` \| `"dns"`)[]

Array containing only the built-in base monitor types

## Remarks

This function returns only the core base types (http, port) that are built
into the system. It does NOT include dynamically registered monitor types
from the registry.

## Example

```typescript
const baseTypes = getBaseMonitorTypes(); // ["http", "port"]
```

## See

MonitorTypeRegistry.getAllTypes for complete type list including dynamic types
