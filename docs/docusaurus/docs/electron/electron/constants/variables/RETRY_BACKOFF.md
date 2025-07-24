# Variable: RETRY\_BACKOFF

> `const` **RETRY\_BACKOFF**: `Readonly`\<\` `INITIAL_DELAY`: `500`; `MAX_DELAY`: `5000`; \`\>

Defined in: [electron/constants.ts:33](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/constants.ts#L33)

Retry backoff configuration for failed operations.

## Remarks

Uses exponential backoff to avoid overwhelming failing services.
