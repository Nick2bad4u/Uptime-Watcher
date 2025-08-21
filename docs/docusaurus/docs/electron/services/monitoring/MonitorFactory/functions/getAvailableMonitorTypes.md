# Function: getAvailableMonitorTypes()

> **getAvailableMonitorTypes**(): `string`[]

Defined in: [electron/services/monitoring/MonitorFactory.ts:127](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/MonitorFactory.ts#L127)

Retrieves all available monitor types from the registry.

## Returns

`string`[]

An array of registered monitor type strings.

## Remarks

This method returns all monitor types currently registered in the system,
including both built-in and dynamically registered types.

## Example

```typescript
const types = getAvailableMonitorTypes();
```
