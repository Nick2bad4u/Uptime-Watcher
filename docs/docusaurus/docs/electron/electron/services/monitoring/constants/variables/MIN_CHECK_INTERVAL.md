# Variable: MIN\_CHECK\_INTERVAL

> `const` **MIN\_CHECK\_INTERVAL**: `1000` = `1000`

Defined in: [electron/services/monitoring/constants.ts:30](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/monitoring/constants.ts#L30)

Minimum recommended interval between monitor checks, in milliseconds.

## Remarks

Used to warn about potentially problematic short intervals. Intervals below this value may cause excessive load or unreliable results.

## Default Value

```ts
1000
@public
```
