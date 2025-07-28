# Function: useSiteStats()

> **useSiteStats**(`history`): [`SiteStats`](../interfaces/SiteStats.md)

Defined in: [src/hooks/site/useSiteStats.ts:62](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/hooks/site/useSiteStats.ts#L62)

Custom hook to calculate statistics based on a monitor's history

## Parameters

### history

[`StatusHistory`](../../../../../shared/types/interfaces/StatusHistory.md)[]

StatusHistory[] - Array of status history records for calculation

## Returns

[`SiteStats`](../interfaces/SiteStats.md)

Object containing calculated statistics (uptime, checkCount, averageResponseTime)

## See

[SiteStats](../interfaces/SiteStats.md) for the complete interface specification

## Remarks

This hook provides memoized statistical calculations for monitor performance analysis.
It handles edge cases including:
- Empty history arrays (returns zero values safely)
- Records without response times (filters them out of average calculation)
- Mixed status records (separates up/down for accurate uptime calculation)

The uptime calculation uses integer percentage (0-100) for display consistency.
Average response time only includes successful "up" checks with valid response times.
All calculations are memoized to prevent unnecessary recalculation on each render.

## Example

```tsx
function MonitorStats({ monitor }) {
  const { uptime, checkCount, averageResponseTime } = useSiteStats(monitor.history);

  return (
    <div>
      <p>Uptime: {uptime}% ({checkCount} checks)</p>
      <p>Avg Response: {averageResponseTime}ms</p>
    </div>
  );
}
```
