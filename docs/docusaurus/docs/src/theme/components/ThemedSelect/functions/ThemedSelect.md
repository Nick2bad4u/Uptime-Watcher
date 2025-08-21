# Function: ThemedSelect()

> **ThemedSelect**(`props`): [`Element`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/80449050d0e5e84f44ffa3fd3dc5651e4747e589/types/react/index.d.ts#L4028)

Defined in: [src/theme/components/ThemedSelect.tsx:116](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/theme/components/ThemedSelect.tsx#L116)

Themed select dropdown component with consistent styling and accessibility
support.

## Parameters

### props

[`ThemedSelectProperties`](../interfaces/ThemedSelectProperties.md)

The component properties

## Returns

[`Element`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/80449050d0e5e84f44ffa3fd3dc5651e4747e589/types/react/index.d.ts#L4028)

The themed select JSX element

## Remarks

This component provides a styled select dropdown with automatic theme
integration, focus states, and accessibility features. The select supports
various event handlers and automatically applies appropriate styling based on
the current theme and state.

## Example

```tsx
<ThemedSelect
    value={timeout}
    onChange={handleTimeoutChange}
    title="Request timeout in seconds"
>
    <option value={5}>5 seconds</option>
    <option value={10}>10 seconds</option>
    <option value={30}>30 seconds</option>
</ThemedSelect>;
```
