# Variable: MAX\_MIGRATION\_STEPS

> `const` **MAX\_MIGRATION\_STEPS**: `100` = `100`

Defined in: [electron/services/monitoring/constants.ts:41](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/monitoring/constants.ts#L41)

Maximum number of migration steps allowed in a migration path.

## Remarks

Used to prevent excessive migration chains that may indicate design issues or migration loops. Helps ensure database migrations remain manageable and safe.

## Default Value

```ts
100
@public
```
