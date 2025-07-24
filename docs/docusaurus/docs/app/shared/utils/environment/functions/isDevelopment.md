# Function: isDevelopment()

> **isDevelopment**(): `boolean`

Defined in: [shared/utils/environment.ts:58](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/shared/utils/environment.ts#L58)

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
