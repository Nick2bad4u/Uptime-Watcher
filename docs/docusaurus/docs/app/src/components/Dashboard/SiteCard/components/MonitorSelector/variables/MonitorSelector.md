# Variable: MonitorSelector

> `const` **MonitorSelector**: [`NamedExoticComponent`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/1a60e1b9a9062ff9c48c681ca3d8b6f717b616b9/types/react/index.d.ts#L571)\<[`MonitorSelectorProperties`](../interfaces/MonitorSelectorProperties.md)\>

Defined in: [src/components/Dashboard/SiteCard/components/MonitorSelector.tsx:50](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/components/Dashboard/SiteCard/components/MonitorSelector.tsx#L50)

Monitor selection dropdown component for switching between site monitors.

Features:
- Dynamic option formatting based on monitor type and configuration
- Event propagation control to prevent card click conflicts
- Optimized with React.memo and useCallback for performance
- Themed select component integration
- Supports HTTP and port monitor types with descriptive labels

## Param

Component props

## Returns

JSX element containing the monitor selector dropdown

## Example

```tsx
<MonitorSelector
  monitors={site.monitors}
  selectedMonitorId="monitor-1"
  onChange={handleMonitorChange}
  className="w-32"
/>
```
