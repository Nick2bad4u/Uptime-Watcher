# Function: logStoreAction()

> **logStoreAction**(`storeName`, `actionName`, `data?`): `void`

Defined in: [src/stores/utils.ts:137](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/stores/utils.ts#L137)

Logger utility for store actions in development mode.

## Parameters

### storeName

`string`

Name of the store performing the action

### actionName

`string`

Name of the action being performed

### data?

`unknown`

Optional data associated with the action

## Returns

`void`

## Remarks

This utility provides consistent logging for store actions during development.
It only logs when NODE_ENV is set to 'development' to avoid performance
impact in production builds.

## Example

```typescript
logStoreAction('SitesStore', 'addSite', { id: 'site-123' });
```
