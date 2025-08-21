# Function: clearMonitorFactoryCache()

> **clearMonitorFactoryCache**(): `void`

Defined in: [electron/services/monitoring/MonitorFactory.ts:106](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/MonitorFactory.ts#L106)

Clears all cached monitor service instances.

## Returns

`void`

## Remarks

Useful for testing, reloading configuration, or resetting the monitor service
state. After calling this method, new service instances will be created on
demand.

## Example

```typescript
clearMonitorFactoryCache();
```
