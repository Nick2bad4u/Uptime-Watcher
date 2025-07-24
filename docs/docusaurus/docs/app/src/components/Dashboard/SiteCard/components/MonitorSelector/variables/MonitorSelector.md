# Variable: MonitorSelector

> `const` **MonitorSelector**: `NamedExoticComponent`\<`MonitorSelectorProperties`\>

Defined in: [src/components/Dashboard/SiteCard/components/MonitorSelector.tsx:48](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/components/Dashboard/SiteCard/components/MonitorSelector.tsx#L48)

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
