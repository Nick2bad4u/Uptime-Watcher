# Variable: SiteCardStatus

> `const` **SiteCardStatus**: `NamedExoticComponent`\<`SiteCardStatusProperties`\>

Defined in: [src/components/Dashboard/SiteCard/SiteCardStatus.tsx:42](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/src/components/Dashboard/SiteCard/SiteCardStatus.tsx#L42)

Status section component for site card displaying current monitor status.

Features:
- Visual status indicator using StatusBadge component
- Monitor type identification in status label
- Optimized with React.memo to prevent unnecessary re-renders
- Consistent styling with theme system

## Param

Component props

## Returns

JSX element containing the status badge

## Example

```tsx
<SiteCardStatus
  selectedMonitorId="http"
  status="up"
/>
```
