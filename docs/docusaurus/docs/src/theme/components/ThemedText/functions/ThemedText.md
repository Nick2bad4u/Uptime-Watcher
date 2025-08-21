# Function: ThemedText()

> **ThemedText**(`props`): [`Element`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/80449050d0e5e84f44ffa3fd3dc5651e4747e589/types/react/index.d.ts#L4028)

Defined in: [src/theme/components/ThemedText.tsx:91](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/theme/components/ThemedText.tsx#L91)

Themed text component with comprehensive typography styling options.

## Parameters

### props

[`ThemedTextProperties`](../interfaces/ThemedTextProperties.md)

The component properties

## Returns

[`Element`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/80449050d0e5e84f44ffa3fd3dc5651e4747e589/types/react/index.d.ts#L4028)

The themed text JSX element

## Remarks

This component provides a flexible text element with CSS class-based styling
that integrates with the theme system. It automatically generates appropriate
class names based on the provided variant, size, weight, and alignment
options.

## Example

```tsx
<ThemedText variant={isOnline ? "success" : "error"} weight="medium">
    {isOnline ? "Online" : "Offline"}
</ThemedText>;
```
