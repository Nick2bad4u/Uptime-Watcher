# Function: isValidHistoryRow()

> **isValidHistoryRow**(`obj`): `obj is HistoryRow`

Defined in: [shared/types/database.ts:181](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/types/database.ts#L181)

Determines if an object conforms to the [HistoryRow](../interfaces/HistoryRow.md) interface.

## Parameters

### obj

`unknown`

The object to check.

## Returns

`obj is HistoryRow`

True if the object matches the [HistoryRow](../interfaces/HistoryRow.md) structure; otherwise, false.

## Remarks

Checks for required properties and value types to ensure type safety.
