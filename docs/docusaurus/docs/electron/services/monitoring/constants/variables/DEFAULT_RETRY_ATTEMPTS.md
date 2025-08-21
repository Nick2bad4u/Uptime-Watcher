# Variable: DEFAULT\_RETRY\_ATTEMPTS

> `const` **DEFAULT\_RETRY\_ATTEMPTS**: `3` = `3`

Defined in: [electron/services/monitoring/constants.ts:23](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/constants.ts#L23)

Default number of retry attempts for monitor checks.

## Remarks

Used when monitor configuration does not specify retry attempts. Controls how
many times a monitor will retry a failed check before reporting a failure.

## Default Value

```ts
3

@public
```
