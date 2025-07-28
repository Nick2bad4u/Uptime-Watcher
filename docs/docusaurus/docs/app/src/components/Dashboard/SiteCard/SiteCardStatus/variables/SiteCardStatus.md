# Variable: SiteCardStatus

> `const` **SiteCardStatus**: [`NamedExoticComponent`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/1a60e1b9a9062ff9c48c681ca3d8b6f717b616b9/types/react/index.d.ts#L571)\<[`SiteCardStatusProperties`](../interfaces/SiteCardStatusProperties.md)\>

Defined in: [src/components/Dashboard/SiteCard/SiteCardStatus.tsx:46](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/Dashboard/SiteCard/SiteCardStatus.tsx#L46)

Status section component for site card displaying current monitor status.

Features:
- Visual status indicator using StatusBadge component
- Monitor type identification in status label
- Optimized with React.memo to prevent unnecessary re-renders
- Consistent styling with theme system

## Param

Component props

## Returns

JSX.Element containing the status badge

## Example

```tsx
<SiteCardStatus
  selectedMonitorId="http"
  status="up"
/>
```

## See

StatusBadge For the underlying status display component
