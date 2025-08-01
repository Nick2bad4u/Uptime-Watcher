# Function: withFallback()

> **withFallback**\<`T`\>(`value`, `fallback`): `T`

Defined in: [src/utils/fallbacks.ts:79](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/utils/fallbacks.ts#L79)

Get value with fallback, checking for null/undefined.

## Type Parameters

### T

`T`

## Parameters

### value

The value to check for null or undefined

`undefined` | `null` | `T`

### fallback

`T`

The fallback value to use if value is null or undefined

## Returns

`T`

The original value if not null/undefined, otherwise the fallback
