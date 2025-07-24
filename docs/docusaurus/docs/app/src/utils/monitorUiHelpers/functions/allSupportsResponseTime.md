# Function: allSupportsResponseTime()

> **allSupportsResponseTime**(`monitorTypes`): `Promise`\<`boolean`\>

Defined in: [src/utils/monitorUiHelpers.ts:37](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/utils/monitorUiHelpers.ts#L37)

Check if all monitor types in array support response time.
Useful for conditional rendering of response time charts.

## Parameters

### monitorTypes

(`"http"` \| `"port"`)[]

Array of monitor types to check

## Returns

`Promise`\<`boolean`\>

Whether all types support response time
