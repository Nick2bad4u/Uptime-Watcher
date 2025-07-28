# Variable: RETRY\_BACKOFF

> `const` **RETRY\_BACKOFF**: [`Readonly`](https://www.typescriptlang.org/docs/handbook/utility-types.html#readonlytype)\<\` `INITIAL_DELAY`: `500`; `MAX_DELAY`: `5000`; \`\>

Defined in: [electron/constants.ts:58](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/constants.ts#L58)

Retry backoff configuration for failed operations.

## Remarks

Used for exponential backoff when retrying failed network or database operations,
to avoid overwhelming external services or the local system.

## Example

```ts
let delay = RETRY_BACKOFF.INITIAL_DELAY;
while (shouldRetry) {
  await wait(delay);
  delay = Math.min(delay * 2, RETRY_BACKOFF.MAX_DELAY);
}
```
