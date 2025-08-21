# Function: ThemedInput()

> **ThemedInput**(`props`): [`Element`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/80449050d0e5e84f44ffa3fd3dc5651e4747e589/types/react/index.d.ts#L4028)

Defined in: [src/theme/components/ThemedInput.tsx:124](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/theme/components/ThemedInput.tsx#L124)

Themed input component with consistent styling and accessibility support.

## Parameters

### props

[`ThemedInputProperties`](../interfaces/ThemedInputProperties.md)

The component properties

## Returns

[`Element`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/80449050d0e5e84f44ffa3fd3dc5651e4747e589/types/react/index.d.ts#L4028)

The themed input JSX element

## Remarks

This component provides a styled input field with automatic theme
integration, focus states, and accessibility features. The input supports
various types and automatically applies appropriate styling based on the
current theme and state.

## Example

```tsx
<ThemedInput
    type="url"
    placeholder="https://example.com"
    value={websiteUrl}
    onChange={handleUrlChange}
    required={true}
/>;
```
