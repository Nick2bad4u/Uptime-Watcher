# Function: ThemedCard()

> **ThemedCard**(`props`): [`Element`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/80449050d0e5e84f44ffa3fd3dc5651e4747e589/types/react/index.d.ts#L4028)

Defined in: [src/theme/components/ThemedCard.tsx:135](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/theme/components/ThemedCard.tsx#L135)

Themed card component for content containers with optional headers, icons,
and interactive features.

## Parameters

### props

[`ThemedCardProperties`](../interfaces/ThemedCardProperties.md)

The component properties

## Returns

[`Element`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/80449050d0e5e84f44ffa3fd3dc5651e4747e589/types/react/index.d.ts#L4028)

The themed card JSX element

## Remarks

This component provides a styled container with configurable theming,
optional header section, and interactive features. The card integrates with
the theme system for consistent styling. When title or subtitle is provided,
renders a header section with optional icon.

## Example

```tsx
<ThemedCard
    title="Monitor Status"
    icon={<StatusIcon />}
    clickable={true}
    onClick={viewDetails}
>
    <StatusContent />
</ThemedCard>;
```
