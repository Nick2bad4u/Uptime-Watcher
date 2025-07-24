# Variable: RETRY\_BACKOFF

> `const` **RETRY\_BACKOFF**: [`Readonly`](https://www.typescriptlang.org/docs/handbook/utility-types.html#readonlytype)\<\` `INITIAL_DELAY`: `500`; `MAX_DELAY`: `5000`; \`\>

Defined in: [electron/constants.ts:33](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/constants.ts#L33)

Retry backoff configuration for failed operations.

## Remarks

Uses exponential backoff to avoid overwhelming failing services.
