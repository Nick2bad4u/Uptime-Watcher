# Function: waitForElectronAPI()

> **waitForElectronAPI**(`maxAttempts`, `baseDelay`): `Promise`\<`void`\>

Defined in: [src/stores/utils.ts:176](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/stores/utils.ts#L176)

Utility function to wait for electronAPI to be available.

## Parameters

### maxAttempts

`number` = `50`

Maximum number of polling attempts

### baseDelay

`number` = `100`

Base delay in milliseconds for exponential backoff

## Returns

`Promise`\<`void`\>

Promise that resolves when electronAPI is available

## Throws

Error when electronAPI is not available after maximum attempts

## Remarks

Polls for the API with exponential backoff to handle timing issues during
application startup. This is necessary because the preload script may not
have finished executing when React components first mount.

## Default Value

```ts
maxAttempts - 50
```

## Default Value

```ts
baseDelay - 100
```

## Example

```typescript
try {
  await waitForElectronAPI();
  // Safe to use window.electronAPI
} catch (error) {
  logger.error('ElectronAPI not available', error as Error);
}
```
