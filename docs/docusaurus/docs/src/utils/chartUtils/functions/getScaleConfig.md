# Function: getScaleConfig()

> **getScaleConfig**(`config`, `axis`): `undefined` \| [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

Defined in: [src/utils/chartUtils.ts:23](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/utils/chartUtils.ts#L23)

Safely get scale configuration.

## Parameters

### config

`unknown`

Chart configuration

### axis

Axis name ("x" or "y")

`"x"` | `"y"`

## Returns

`undefined` \| [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

Scale configuration or undefined
