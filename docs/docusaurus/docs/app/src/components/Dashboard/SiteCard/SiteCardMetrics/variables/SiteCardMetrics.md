# Variable: SiteCardMetrics

> `const` **SiteCardMetrics**: `NamedExoticComponent`\<`SiteCardMetricsProperties`\>

Defined in: [src/components/Dashboard/SiteCard/SiteCardMetrics.tsx:46](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/src/components/Dashboard/SiteCard/SiteCardMetrics.tsx#L46)

Metrics grid component displaying key site monitoring statistics.

Features:
- Four-column grid layout for status, uptime, response time, and check count
- Optimized with React.memo and useMemo to prevent unnecessary re-renders
- Consistent metric card formatting
- Handles undefined response times gracefully

## Param

Component props

## Returns

JSX element containing the metrics grid

## Example

```tsx
<SiteCardMetrics
  status="up"
  uptime={98.5}
  responseTime={250}
  checkCount={144}
/>
```
