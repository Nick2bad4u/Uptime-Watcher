# Variable: UptimeChart

> `const` **UptimeChart**: [`MemoExoticComponent`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/80449050d0e5e84f44ffa3fd3dc5651e4747e589/types/react/index.d.ts#L1545)\<(``
        data,
        options,
    ``) => [`JSX.Element`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/80449050d0e5e84f44ffa3fd3dc5651e4747e589/types/react/jsx-runtime.d.ts#L6)\>

Defined in: [src/components/SiteDetails/charts/UptimeChart.tsx:80](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/SiteDetails/charts/UptimeChart.tsx#L80)

Memoized uptime distribution doughnut chart component for site monitoring
visualization.

## Remarks

Displays uptime vs downtime distribution using a doughnut chart visualization
with Chart.js. The component is memoized to prevent unnecessary re-renders
when parent component updates, providing optimal performance for frequent
data updates in monitoring contexts.

## Example

```tsx
<UptimeChart data={uptimeChartData} options={doughnutOptions} />;
```

## Param

The component properties containing data and options for the
  chart

## Returns

Memoized doughnut chart component
