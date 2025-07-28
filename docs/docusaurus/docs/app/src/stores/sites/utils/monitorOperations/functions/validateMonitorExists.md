# Function: validateMonitorExists()

> **validateMonitorExists**(`site`, `monitorId`): `void`

Defined in: [src/stores/sites/utils/monitorOperations.ts:154](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/stores/sites/utils/monitorOperations.ts#L154)

Validates that a monitor exists in a site

## Parameters

### site

The site to check for the monitor

`undefined` | [`Site`](../../../../../../shared/types/interfaces/Site.md)

### monitorId

`string`

The ID of the monitor to validate

## Returns

`void`

## Throws

Error if site is not found or monitor does not exist

## Example

```typescript
validateMonitorExists(site, "monitor-123");
```
