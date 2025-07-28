# Variable: MAX\_LOG\_DATA\_LENGTH

> `const` **MAX\_LOG\_DATA\_LENGTH**: `500` = `500`

Defined in: [electron/services/monitoring/constants.ts:52](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/monitoring/constants.ts#L52)

Maximum length of data content to include in migration error logs, in characters.

## Remarks

Used to prevent log pollution while preserving debugging context. Limits the amount of data included in error logs for failed migrations.

## Default Value

```ts
500
@public
```
