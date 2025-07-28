# Variable: DEFAULT\_RETRY\_ATTEMPTS

> `const` **DEFAULT\_RETRY\_ATTEMPTS**: `3` = `3`

Defined in: [electron/services/monitoring/constants.ts:19](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/monitoring/constants.ts#L19)

Default number of retry attempts for monitor checks.

## Remarks

Used when monitor configuration does not specify retry attempts. Controls how many times a monitor will retry a failed check before reporting a failure.

## Default Value

```ts
3
@public
```
