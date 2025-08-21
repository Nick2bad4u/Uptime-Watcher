# Variable: MONITOR\_TIMEOUT\_BUFFER\_MS

> `const` **MONITOR\_TIMEOUT\_BUFFER\_MS**: `5000` = `5000`

Defined in: [electron/services/monitoring/constants.ts:61](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/constants.ts#L61)

Buffer time added to monitor timeouts for operation cleanup, in milliseconds.

## Remarks

Added to monitor timeout to ensure operations have time to clean up before
being forcibly terminated.

## Default Value

```ts
5000

@public
```
