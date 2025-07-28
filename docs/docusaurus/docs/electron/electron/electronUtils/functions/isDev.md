# Function: isDev()

> **isDev**(): `boolean`

Defined in: [electron/electronUtils.ts:39](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/electronUtils.ts#L39)

Determines if the Electron app is running in development mode.

## Returns

`boolean`

`true` if running in Electron development mode (unpackaged and `NODE_ENV=development`), otherwise `false`.

## Remarks

This function returns `true` only if both:
- The `NODE_ENV` environment variable is set to `"development"` (as determined by `isDevelopment()`), and
- The Electron app is not packaged (`app.isPackaged` is `false`).

Use this to distinguish between development and production builds in Electron-specific code,
such as enabling hot reload or verbose logging only during development.

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
