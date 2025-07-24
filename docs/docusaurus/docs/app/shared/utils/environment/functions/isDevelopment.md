# Function: isDevelopment()

> **isDevelopment**(): `boolean`

Defined in: [shared/utils/environment.ts:58](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/shared/utils/environment.ts#L58)

Check if running in development mode.
Safe alternative to direct process.env.NODE_ENV access.

## Returns

`boolean`

True if in development mode

## Example

```typescript
if (isDevelopment()) {
    console.log("Debug information");
}
```
