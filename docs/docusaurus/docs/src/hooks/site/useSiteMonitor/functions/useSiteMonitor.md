# Function: useSiteMonitor()

> **useSiteMonitor**(`site`): [`SiteMonitorResult`](../interfaces/SiteMonitorResult.md)

Defined in: [src/hooks/site/useSiteMonitor.ts:105](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/site/useSiteMonitor.ts#L105)

Hook to manage monitor selection and state for a specific site

## Parameters

### site

[`Site`](../../../../../shared/types/interfaces/Site.md)

The site object to monitor

## Returns

[`SiteMonitorResult`](../interfaces/SiteMonitorResult.md)

Monitor data and helper functions

## Remarks

This hook manages monitor selection and provides current state for site
monitoring. It handles edge cases including:

- Sites with no monitors (returns empty data with safe defaults)
- Invalid monitor selections (falls back to first available monitor)
- Undefined monitor references (provides safe fallback values)

The hook automatically selects the most recent site data from the store to
ensure UI consistency when site data is updated elsewhere in the
application.

## Example

```tsx
function SiteMonitorCard({ site }) {
  const {
    monitor,
    status,
    isMonitoring,
    handleMonitorIdChange
  } = useSiteMonitor(site);

  if (!monitor) {
    return <div>No monitors configured for this site</div>;
  }

  return (
    <div>
      <select onChange={handleMonitorIdChange}>
        {monitorIds.map(id => <option key={id} value={id}>{id}</option>)}
      </select>
      <p>Status: {status}</p>
      <p>Monitoring: {isMonitoring ? 'Active' : 'Paused'}</p>
    </div>
  );
}
```

## See

[SiteMonitorResult](../interfaces/SiteMonitorResult.md) for the complete interface specification
