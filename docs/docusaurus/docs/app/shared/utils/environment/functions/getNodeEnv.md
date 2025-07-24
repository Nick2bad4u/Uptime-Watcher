# Function: getNodeEnv()

> **getNodeEnv**(): `string`

Defined in: [shared/utils/environment.ts:31](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/shared/utils/environment.ts#L31)

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
