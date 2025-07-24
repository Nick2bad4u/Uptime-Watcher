# Variable: SiteCardStatus

> `const` **SiteCardStatus**: `NamedExoticComponent`\<`SiteCardStatusProperties`\>

Defined in: [src/components/Dashboard/SiteCard/SiteCardStatus.tsx:42](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/components/Dashboard/SiteCard/SiteCardStatus.tsx#L42)

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
