# Variable: RETRY\_BACKOFF

> `const` **RETRY\_BACKOFF**: `Readonly`\<\` `INITIAL_DELAY`: `500`; `MAX_DELAY`: `5000`; \`\>

Defined in: [electron/constants.ts:33](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/constants.ts#L33)

Retry backoff configuration for failed operations.

## Remarks

Uses exponential backoff to avoid overwhelming failing services.
