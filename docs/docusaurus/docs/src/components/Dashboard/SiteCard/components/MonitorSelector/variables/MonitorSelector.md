# Variable: MonitorSelector

> `const` **MonitorSelector**: [`React.NamedExoticComponent`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/80449050d0e5e84f44ffa3fd3dc5651e4747e589/types/react/index.d.ts#L571)\<[`MonitorSelectorProperties`](../interfaces/MonitorSelectorProperties.md)\>

Defined in: [src/components/Dashboard/SiteCard/components/MonitorSelector.tsx:54](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/Dashboard/SiteCard/components/MonitorSelector.tsx#L54)

Monitor selection dropdown component for switching between site monitors.

Features:

- Dynamic option formatting based on monitor type and configuration
- Event propagation control to prevent card click conflicts
- Optimized with React.memo and useCallback for performance
- Themed select component integration
- Supports HTTP and port monitor types with descriptive labels

## Example

```tsx
<MonitorSelector
    monitors={site.monitors}
    selectedMonitorId="monitor-1"
    onChange={handleMonitorChange}
    className="w-32"
/>;
```

## Param

Component props

## Returns

JSX.Element containing the monitor selector dropdown
