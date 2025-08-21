# Variable: SiteCardMetrics

> `const` **SiteCardMetrics**: [`React.NamedExoticComponent`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/80449050d0e5e84f44ffa3fd3dc5651e4747e589/types/react/index.d.ts#L571)\<[`SiteCardMetricsProperties`](../interfaces/SiteCardMetricsProperties.md)\>

Defined in: [src/components/Dashboard/SiteCard/SiteCardMetrics.tsx:52](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/Dashboard/SiteCard/SiteCardMetrics.tsx#L52)

Metrics grid component displaying key site monitoring statistics.

Features:

- Four-column grid layout for status, uptime, response time, and check count
- Optimized with React.memo and useMemo to prevent unnecessary re-renders
- Consistent metric card formatting
- Handles undefined response times gracefully (displays "-" when not available)
- Formats uptime to 1 decimal place for consistency

## Example

```tsx
<SiteCardMetrics
    status="up"
    uptime={98.5}
    responseTime={250}
    checkCount={144}
/>;
```

## Param

Component props

## Returns

JSX.Element containing the metrics grid
