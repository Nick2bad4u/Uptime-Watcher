# Variable: RETRY\_BACKOFF

> `const` **RETRY\_BACKOFF**: `RetryBackoffConfig`

Defined in: [electron/constants.ts:84](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/constants.ts#L84)

Retry backoff configuration for failed operations.

## Remarks

Used for exponential backoff when retrying failed network or database
operations, to avoid overwhelming external services or the local system.

## Example

```ts
let delay = RETRY_BACKOFF.INITIAL_DELAY;
while (shouldRetry) {
    await wait(delay);
    delay = Math.min(delay * 2, RETRY_BACKOFF.MAX_DELAY);
}
```
