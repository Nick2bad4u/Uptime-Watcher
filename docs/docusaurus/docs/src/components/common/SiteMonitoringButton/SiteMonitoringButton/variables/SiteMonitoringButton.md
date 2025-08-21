# Variable: SiteMonitoringButton

> `const` **SiteMonitoringButton**: [`React.NamedExoticComponent`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/80449050d0e5e84f44ffa3fd3dc5651e4747e589/types/react/index.d.ts#L571)\<[`SiteMonitoringButtonProperties`](../interfaces/SiteMonitoringButtonProperties.md)\>

Defined in: [src/components/common/SiteMonitoringButton/SiteMonitoringButton.tsx:103](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/common/SiteMonitoringButton/SiteMonitoringButton.tsx#L103)

Reusable site monitoring button that handles start/stop all monitoring.

## Remarks

This component provides a consistent interface for site-wide monitoring
controls across different parts of the application. It automatically switches
between start and stop states based on whether all monitors are currently
running.

Key features:

- Automatic state switching based on monitor status
- Event propagation prevention to avoid parent element interactions
- Loading state handling with button disabling
- Compact mode for space-constrained layouts
- Consistent styling with theme integration

The component uses the appropriate variant (success for start, error for
stop) and includes intuitive emoji icons for visual clarity.

## Example

```tsx
// Standard usage
<SiteMonitoringButton
  allMonitorsRunning={site.monitors.every(m => m.monitoring)}
  isLoading={false}
  onStartSiteMonitoring={handleStart}
  onStopSiteMonitoring={handleStop}
/>

// Compact mode for site cards
<SiteMonitoringButton
  allMonitorsRunning={allRunning}
  compact
  isLoading={loading}
  onStartSiteMonitoring={handleStart}
  onStopSiteMonitoring={handleStop}
/>
```

## Param

Component configuration and event handlers

## Returns

JSX element containing the themed monitoring button
