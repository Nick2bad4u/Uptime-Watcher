# Function: getMonitorTypeOptions()

> **getMonitorTypeOptions**(): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`object`[]\>

Defined in: [src/utils/monitorTypeHelper.ts:109](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/utils/monitorTypeHelper.ts#L109)

Get form options for monitor type selector.

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`object`[]\>

Promise resolving to array of option objects for form selectors

## Remarks

Returns an array of objects with the shape: `` label: string, value: string``
where label is the human-readable display name and value is the monitor type
identifier. This format is suitable for use with form select components and
dropdown menus. The options are derived from all available monitor types from
the backend.
