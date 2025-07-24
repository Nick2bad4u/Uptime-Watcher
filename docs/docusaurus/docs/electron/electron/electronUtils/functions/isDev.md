# Function: isDev()

> **isDev**(): `boolean`

Defined in: [electron/electronUtils.ts:35](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/electronUtils.ts#L35)

Determines if the Electron app is running in development mode (unpackaged and NODE_ENV=development).

## Returns

`boolean`

`true` if running in Electron development mode (unpackaged and NODE_ENV=development), `false` otherwise

## Remarks

This function extends `isDevelopment()` by also checking that the Electron app is not packaged.
Use this to distinguish between development and production builds in Electron-specific code.

## Example

```typescript
if (isDev()) {
  logger.debug("Running in development mode - enabling debug features");
  // Enable hot reload, detailed logging, etc.
} else {
  logger.info("Running in production mode");
  // Optimize for performance, reduce logging
}
```
