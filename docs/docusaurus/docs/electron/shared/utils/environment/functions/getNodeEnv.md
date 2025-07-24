# Function: getNodeEnv()

> **getNodeEnv**(): `string`

Defined in: [shared/utils/environment.ts:31](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/shared/utils/environment.ts#L31)

Get the current NODE_ENV value safely.
Safe alternative to direct process.env.NODE_ENV access.

## Returns

`string`

The NODE_ENV value or 'development' as fallback

## Example

```typescript
const env = getNodeEnv();
logger.debug("Current environment:", env);
```
