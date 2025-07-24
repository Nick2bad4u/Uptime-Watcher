# Function: waitForElectronAPI()

> **waitForElectronAPI**(`maxAttempts`, `baseDelay`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [src/stores/utils.ts:176](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/stores/utils.ts#L176)

Utility function to wait for electronAPI to be available.

## Parameters

### maxAttempts

`number` = `50`

Maximum number of polling attempts

### baseDelay

`number` = `100`

Base delay in milliseconds for exponential backoff

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

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
