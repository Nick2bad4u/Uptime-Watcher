# Function: useSiteAnalytics()

> **useSiteAnalytics**(`monitor`, `timeRange`): [`SiteAnalytics`](../interfaces/SiteAnalytics.md)

Defined in: [src/hooks/site/useSiteAnalytics.ts:124](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/src/hooks/site/useSiteAnalytics.ts#L124)

Hook for calculating comprehensive site analytics and metrics.

Performs complex calculations on monitor data to provide detailed insights
including uptime statistics, response time analysis, and downtime patterns.
All calculations are memoized for optimal performance.

## Parameters

### monitor

The monitor to analyze (can be undefined)

`undefined` | [`Monitor`](../../../../../shared/types/interfaces/Monitor.md)

### timeRange

Time period to analyze (defaults to "24h")

`"1h"` | `"7d"` | `"24h"` | `"30d"` | `"12h"`

## Returns

[`SiteAnalytics`](../interfaces/SiteAnalytics.md)

Comprehensive analytics object with all calculated metrics

## Example

```tsx
function AnalyticsView({ monitor }) {
  const analytics = useSiteAnalytics(monitor, "7d");

  return (
    <div>
      <p>Uptime: {analytics.uptime}</p>
      <p>Avg Response: {analytics.avgResponseTime}ms</p>
      <p>Incidents: {analytics.incidentCount}</p>
    </div>
  );
}
```
