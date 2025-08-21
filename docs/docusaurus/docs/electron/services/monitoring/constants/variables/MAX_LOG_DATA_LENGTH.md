# Variable: MAX\_LOG\_DATA\_LENGTH

> `const` **MAX\_LOG\_DATA\_LENGTH**: `500` = `500`

Defined in: [electron/services/monitoring/constants.ts:101](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/constants.ts#L101)

Maximum length of data content to include in migration error logs, in
characters.

## Remarks

Used to prevent log pollution while preserving debugging context. Limits the
amount of data included in error logs for failed migrations.

## Default Value

```ts
500

@public
```
