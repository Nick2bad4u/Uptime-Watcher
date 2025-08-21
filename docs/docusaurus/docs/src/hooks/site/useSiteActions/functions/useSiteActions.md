# Function: useSiteActions()

> **useSiteActions**(`site`, `monitor`): [`SiteActionsResult`](../interfaces/SiteActionsResult.md)

Defined in: [src/hooks/site/useSiteActions.ts:88](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/site/useSiteActions.ts#L88)

Hook to handle site-related actions including monitoring control and
navigation.

## Parameters

### site

[`Site`](../../../../../shared/types/interfaces/Site.md)

The site object to act upon

### monitor

The specific monitor to use for individual monitor actions

`undefined` | [`Monitor`](../../../../../shared/types/interfaces/Monitor.md)

## Returns

[`SiteActionsResult`](../interfaces/SiteActionsResult.md)

Object containing all available action handler functions

## Remarks

This hook provides a comprehensive set of action handlers for site
operations, including both individual monitor control and site-wide
monitoring management. All operations are properly logged for debugging and
analytics purposes.

The hook integrates with the sites store for state management and includes
proper error handling with user-friendly logging. All handlers are wrapped in
useCallback for performance optimization.

Monitoring operations support both individual monitor control (start/stop
specific monitor) and site-wide control (start/stop all monitors for a
site).

## Example

```tsx
function SiteCard({ site }) {
  const { monitor } = useSiteMonitor(site);
  const {
    handleStartSiteMonitoring,
    handleStopSiteMonitoring,
    handleCheckNow
  } = useSiteActions(site, monitor);

  return (
    <div>
      <button onClick={handleStartSiteMonitoring}>Start All</button>
      <button onClick={handleStopSiteMonitoring}>Stop All</button>
      <button onClick={handleCheckNow}>Check Now</button>
    </div>
  );
}
```
