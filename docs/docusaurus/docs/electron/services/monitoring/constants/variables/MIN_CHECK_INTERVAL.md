# Variable: MIN\_CHECK\_INTERVAL

> `const` **MIN\_CHECK\_INTERVAL**: `1000` = `1000`

Defined in: [electron/services/monitoring/constants.ts:36](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/constants.ts#L36)

Minimum recommended interval between monitor checks, in milliseconds.

## Remarks

Used to warn about potentially problematic short intervals. Intervals below
this value may cause excessive load or unreliable results.

## Default Value

```ts
1000

@public
```
