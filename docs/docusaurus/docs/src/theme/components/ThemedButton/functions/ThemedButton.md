# Function: ThemedButton()

> **ThemedButton**(`props`): [`Element`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/80449050d0e5e84f44ffa3fd3dc5651e4747e589/types/react/index.d.ts#L4028)

Defined in: [src/theme/components/ThemedButton.tsx:133](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/theme/components/ThemedButton.tsx#L133)

Themed button component with comprehensive styling and state management.

## Parameters

### props

[`ThemedButtonProperties`](../interfaces/ThemedButtonProperties.md)

The component properties

## Returns

[`Element`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/80449050d0e5e84f44ffa3fd3dc5651e4747e589/types/react/index.d.ts#L4028)

The themed button JSX element

## Remarks

This component provides a full-featured button implementation with theming
support, loading states, disabled states, icon positioning, and various
visual variants. The button automatically handles accessibility features and
prevents clicks when disabled or loading.

## Example

```tsx
<ThemedButton
    variant="primary"
    loading={isProcessing}
    onClick={handleAction}
    disabled={!canSubmit}
>
    Process Data
</ThemedButton>;
```
