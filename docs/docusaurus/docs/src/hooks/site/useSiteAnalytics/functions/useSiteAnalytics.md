# Function: useSiteAnalytics()

> **useSiteAnalytics**(`monitor`, `timeRange`): [`SiteAnalytics`](../interfaces/SiteAnalytics.md)

Defined in: [src/hooks/site/useSiteAnalytics.ts:289](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/site/useSiteAnalytics.ts#L289)

Hook for calculating comprehensive site analytics and metrics.

Performs complex calculations on monitor data to provide detailed insights
including uptime statistics, response time analysis, and downtime patterns.
All calculations are memoized for optimal performance.

## Parameters

### monitor

The monitor to analyze (can be undefined)

`undefined` | [`Monitor`](../../../../../shared/types/interfaces/Monitor.md)

### timeRange

keyof [`ChartTimePeriods`](../../../../constants/interfaces/ChartTimePeriods.md) = `"24h"`

Time period to analyze (defaults to "24h")

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

## See

[SiteAnalytics](../interfaces/SiteAnalytics.md) for the complete interface specification
