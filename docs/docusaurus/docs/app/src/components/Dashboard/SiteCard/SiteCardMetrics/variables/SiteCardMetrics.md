# Variable: SiteCardMetrics

> `const` **SiteCardMetrics**: [`NamedExoticComponent`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/1a60e1b9a9062ff9c48c681ca3d8b6f717b616b9/types/react/index.d.ts#L571)\<[`SiteCardMetricsProperties`](../interfaces/SiteCardMetricsProperties.md)\>

Defined in: [src/components/Dashboard/SiteCard/SiteCardMetrics.tsx:49](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/Dashboard/SiteCard/SiteCardMetrics.tsx#L49)

Metrics grid component displaying key site monitoring statistics.

Features:
- Four-column grid layout for status, uptime, response time, and check count
- Optimized with React.memo and useMemo to prevent unnecessary re-renders
- Consistent metric card formatting
- Handles undefined response times gracefully (displays "-" when not available)
- Formats uptime to 1 decimal place for consistency

## Param

Component props

## Returns

JSX.Element containing the metrics grid

## Example

```tsx
<SiteCardMetrics
  status="up"
  uptime={98.5}
  responseTime={250}
  checkCount={144}
/>
```
