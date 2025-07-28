# Function: getNestedScaleProperty()

> **getNestedScaleProperty**(`config`, `axis`, `path`): `unknown`

Defined in: [src/utils/chartUtils.ts:16](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/utils/chartUtils.ts#L16)

Safely get nested property from scale configuration.

## Parameters

### config

`unknown`

Chart configuration

### axis

Axis name ("x" or "y")

`"x"` | `"y"`

### path

`string`

Property path (e.g., "title.text")

## Returns

`unknown`

Property value or undefined
