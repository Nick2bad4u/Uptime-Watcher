# Function: getNodeEnv()

> **getNodeEnv**(): `string`

Defined in: [shared/utils/environment.ts:31](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/shared/utils/environment.ts#L31)

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
