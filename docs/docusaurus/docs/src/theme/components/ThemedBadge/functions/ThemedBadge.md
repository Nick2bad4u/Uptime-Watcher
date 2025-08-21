# Function: ThemedBadge()

> **ThemedBadge**(`props`): [`Element`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/80449050d0e5e84f44ffa3fd3dc5651e4747e589/types/react/index.d.ts#L4028)

Defined in: [src/theme/components/ThemedBadge.tsx:95](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/theme/components/ThemedBadge.tsx#L95)

Themed badge component for status indicators, labels, and informational
elements.

## Parameters

### props

[`ThemedBadgeProperties`](../interfaces/ThemedBadgeProperties.md)

The component properties

## Returns

[`Element`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/80449050d0e5e84f44ffa3fd3dc5651e4747e589/types/react/index.d.ts#L4028)

The themed badge JSX element

## Remarks

This component provides a compact way to display status information with
consistent theming. The badge automatically calculates appropriate colors,
spacing, and typography based on the selected variant and size. Icons are
automatically colored to match the theme.

## Example

```tsx
<ThemedBadge
    variant={site.isOnline ? "success" : "error"}
    icon={<StatusIcon />}
>
    {site.isOnline ? "Online" : "Offline"}
</ThemedBadge>;
```
