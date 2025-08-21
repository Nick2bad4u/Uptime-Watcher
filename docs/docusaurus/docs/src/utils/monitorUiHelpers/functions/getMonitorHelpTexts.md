# Function: getMonitorHelpTexts()

> **getMonitorHelpTexts**(`monitorType`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\` `primary?`: `string`; `secondary?`: `string`; \`\>

Defined in: [src/utils/monitorUiHelpers.ts:296](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/utils/monitorUiHelpers.ts#L296)

Get help text for monitor type form fields.

## Parameters

### monitorType

Type of monitor

`"http"` | `"port"` | `"ping"` | `"dns"`

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\` `primary?`: `string`; `secondary?`: `string`; \`\>

Object containing primary and secondary help texts
