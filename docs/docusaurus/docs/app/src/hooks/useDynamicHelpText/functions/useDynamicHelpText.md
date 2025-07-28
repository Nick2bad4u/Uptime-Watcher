# Function: useDynamicHelpText()

> **useDynamicHelpText**(`monitorType`): [`DynamicHelpTextResult`](../interfaces/DynamicHelpTextResult.md)

Defined in: [src/hooks/useDynamicHelpText.ts:68](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/hooks/useDynamicHelpText.ts#L68)

Custom hook for dynamically loading monitor type help text.

## Parameters

### monitorType

The monitor type to load help text for

`"http"` | `"port"`

## Returns

[`DynamicHelpTextResult`](../interfaces/DynamicHelpTextResult.md)

Object containing help text data and loading state

## Remarks

Provides monitor-specific help text with automatic loading state management.
Handles cancellation of pending requests on unmount or monitor type changes.
