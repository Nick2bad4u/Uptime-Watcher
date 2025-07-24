# Function: isBaseMonitorType()

> **isBaseMonitorType**(`type`): type is "http" \| "port"

Defined in: [electron/services/monitoring/monitorTypes.ts:64](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/services/monitoring/monitorTypes.ts#L64)

Type guard to check if a string is a valid base monitor type.

## Parameters

### type

`string`

The string to check against base monitor types

## Returns

type is "http" \| "port"

True if the type is a known base monitor type

## Remarks

This function only validates against BASE monitor types (http, port).
It does NOT check against dynamically registered types in the registry.
For full type checking including dynamic types, use the registry.

## Example

```typescript
if (isBaseMonitorType("http")) {
  // TypeScript knows this is a valid MonitorType
}
```

## See

MonitorTypeRegistry.isValidType for complete type checking
