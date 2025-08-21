# Variable: SiteCardStatus

> `const` **SiteCardStatus**: [`React.NamedExoticComponent`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/80449050d0e5e84f44ffa3fd3dc5651e4747e589/types/react/index.d.ts#L571)\<[`SiteCardStatusProperties`](../interfaces/SiteCardStatusProperties.md)\>

Defined in: [src/components/Dashboard/SiteCard/SiteCardStatus.tsx:46](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/Dashboard/SiteCard/SiteCardStatus.tsx#L46)

Status section component for site card displaying current monitor status.

Features:

- Visual status indicator using StatusBadge component
- Monitor type identification in status label
- Optimized with React.memo to prevent unnecessary re-renders
- Consistent styling with theme system

## Example

```tsx
<SiteCardStatus selectedMonitorId="http" status="up" />;
```

## Param

Component props

## Returns

JSX.Element containing the status badge

## See

StatusBadge For the underlying status display component
